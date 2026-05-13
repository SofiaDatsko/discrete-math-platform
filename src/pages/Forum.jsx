import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase';
import { getPathFromURL } from './utils';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, updateDoc, increment, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useTranslation } from 'react-i18next'; // Додано для перекладу
import './Forum.css'; 

// --- Допоміжні Компоненти ---

// Компонент для відображення файлу
const FileRenderer = ({ file }) => {
  if (!file || !file.url) return null;
  
  if (file.type.startsWith('image/')) {
    return <img src={file.url} alt={file.name} className="attached-image" />;
  }
  
  return (
    <a href={file.url} target="_blank" rel="noreferrer" className="attached-file">
      📄 {file.name}
    </a>
  );
};

// Компонент для форми відповіді
const AnswerForm = ({ questionId, uploading, handleAddAnswer, newAnswer, setNewAnswer, answerFiles, handleAnswerFileChange }) => {
  const { t } = useTranslation(); // Використовуємо переклад у формі
  return (
    <div className="answer-form-container">
      <textarea
        rows={3}
        placeholder={t('forum_answer_placeholder')}
        value={newAnswer[questionId] || ''}
        onChange={e => setNewAnswer(prev => ({ ...prev, [questionId]: e.target.value }))}
        className="forum-textarea"
        disabled={uploading}
      />
      <div className="form-actions">
        <input
          type="file"
          id={`file-answer-${questionId}`}
          className="file-input"
          accept=".doc,.docx,.pdf,image/png,image/jpeg"
          onChange={(e) => handleAnswerFileChange(e, questionId)}
          disabled={uploading}
        />
        <label htmlFor={`file-answer-${questionId}`} className="file-input-label">
          📎 {answerFiles[questionId] ? answerFiles[questionId].name : t('forum_attach_file')}
        </label>
        <button onClick={() => handleAddAnswer(questionId)} disabled={uploading} className="btn btn-primary">
          {uploading ? t('forum_sending') : t('forum_answer_btn')}
        </button>
      </div>
    </div>
  );
};

// Компонент для одного питання
const QuestionItem = ({ q, answers, ...props }) => {
    const [showAnswers, setShowAnswers] = useState(false);
    const currentUser = auth.currentUser;
    const { t } = useTranslation(); // Переклад для карток

    return (
        <li className="question-card">
            <div className="question-header">
                <h3>{q.topic}</h3>
                <div className="meta-info">
                    <span>👤 {q.author || t('forum_anonymous')}</span>
                    <span>🗓️ {q.createdAt?.toDate().toLocaleDateString()}</span>
                </div>
            </div>
            <p className="question-text">{q.text}</p>
            <FileRenderer file={q.file} />
            <div className="question-tags">
                {q.tags && q.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
            <div className="question-actions">
                <button onClick={() => props.handleVoteQuestion(q.id)} className="vote-btn">
                    👍 {q.votes || 0}
                </button>
                <button onClick={() => setShowAnswers(!showAnswers)} className="answer-toggle-btn">
                    💬 {answers[q.id]?.length || 0} {showAnswers ? t('forum_hide_answers') : t('forum_show_answers')}
                </button>
                {currentUser?.uid === q.authorId && (
                    <button onClick={() => props.handleDeleteQuestion(q)} className="delete-btn">
                        🗑️
                    </button>
                )}
            </div>

            {showAnswers && (
                <div className="answers-section">
                    <h4>{t('forum_answers_title')}:</h4>
                    {answers[q.id] && answers[q.id].length > 0 ? (
                        <ul className="answers-list">
                            {answers[q.id].map(a => (
                                <li key={a.id} className="answer-card">
                                    <p>{a.text}</p>
                                    <FileRenderer file={a.file} />
                                    <div className="meta-info">
                                        <span>👤 {a.author || t('forum_anonymous')}</span>
                                        <span>🗓️ {a.createdAt?.toDate().toLocaleDateString()}</span>
                                        <button onClick={() => props.handleVoteAnswer(q.id, a.id)} className="vote-btn small">
                                            👍 {a.votes || 0}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="no-answers">{t('forum_no_answers')}</p>}
                    <AnswerForm questionId={q.id} {...props} />
                </div>
            )}
        </li>
    );
};


// --- Головний Компонент Форуму ---

export default function Forum() {
  const { t } = useTranslation(); // Головний хук перекладу
  const [questions, setQuestions] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState({});
  const [answers, setAnswers] = useState({});
  const [tagsInput, setTagsInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [answerFiles, setAnswerFiles] = useState({});

  const handleQuestionFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleAnswerFileChange = (e, questionId) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAnswerFiles(prev => ({ ...prev, [questionId]: file }));
    }
  };

  useEffect(() => {
        const q = query(collection(db, 'forum'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const qs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setQuestions(qs);
    
          qs.forEach(question => {
            const answersQuery = query(collection(db, 'forum', question.id, 'answers'), orderBy('createdAt', 'asc'));
            onSnapshot(answersQuery, (snap) => {
              setAnswers(prev => ({ ...prev, [question.id]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
            });
          });
        });
        return unsubscribe;
  }, []);

    const uploadFile = async (file, path) => {
        if (!file) return null;
        setUploading(true);
        try {
            const storageRef = ref(storage, path);
            await uploadBytesResumable(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setUploading(false);
            return { url, name: file.name, type: file.type };
        } catch (error) {
            setUploading(false);
            alert(t('forum_error_upload') + error.message);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newTopic.trim() === '' || newQuestion.trim() === '') return;
        if (!auth.currentUser) return alert(t('forum_alert_login'));
        
        const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        let fileData = null;
        if (fileToUpload) {
            const path = `forum_files/${auth.currentUser.uid}_${Date.now()}_${fileToUpload.name}`;
            fileData = await uploadFile(fileToUpload, path);
            if (!fileData) return alert(t('forum_alert_file_fail'));
        }

        await addDoc(collection(db, 'forum'), {
            topic: newTopic,
            text: newQuestion,
            createdAt: serverTimestamp(),
            author: auth.currentUser.displayName || t('forum_anonymous'),
            authorId: auth.currentUser.uid,
            votes: 0,
            tags,
            file: fileData,
        });

        setNewTopic(''); setNewQuestion(''); setTagsInput(''); setFileToUpload(null);
    };

    const handleAddAnswer = async (questionId) => {
        if (!newAnswer[questionId]?.trim()) return;
        if (!auth.currentUser) return alert(t('forum_alert_login'));
        
        let fileData = null;
        if (answerFiles[questionId]) {
            const file = answerFiles[questionId];
            const path = `forum_files/${auth.currentUser.uid}_${Date.now()}_${file.name}`;
            fileData = await uploadFile(file, path);
        }

        await addDoc(collection(db, 'forum', questionId, 'answers'), {
            text: newAnswer[questionId],
            author: auth.currentUser.displayName || t('forum_anonymous'),
            authorId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            votes: 0,
            file: fileData,
        });

        setNewAnswer(prev => ({ ...prev, [questionId]: '' }));
        setAnswerFiles(prev => ({ ...prev, [questionId]: null }));
    };

    const handleVoteQuestion = async (questionId) => {
        if (!auth.currentUser) return alert(t('forum_alert_vote'));
        await updateDoc(doc(db, 'forum', questionId), { votes: increment(1) });
    };

    const handleVoteAnswer = async (questionId, answerId) => {
        if (!auth.currentUser) return alert(t('forum_alert_vote'));
        await updateDoc(doc(db, 'forum', questionId, 'answers', answerId), { votes: increment(1) });
    };

    const handleDeleteQuestion = async (question) => {
        if (auth.currentUser?.uid !== question.authorId) return alert(t('forum_alert_delete_own'));
        if (!window.confirm(t('forum_confirm_delete'))) return;
        
        if (question.file?.url) {
            try {
                const path = getPathFromURL(question.file.url);
                if (path) await deleteObject(ref(storage, path));
            } catch (error) { console.warn('File delete fail:', error.message); }
        }

        const answersSnapshot = await getDocs(collection(db, 'forum', question.id, 'answers'));
        for (const docSnap of answersSnapshot.docs) {
            await deleteDoc(doc(db, 'forum', question.id, 'answers', docSnap.id));
        }
        await deleteDoc(doc(db, 'forum', question.id));
    };

  const filteredQuestions = questions.filter(q => 
    q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tags?.some(tag => tag.includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="forum-container">
      <header className="forum-header">
        <h2>{t('forum_title')}</h2>
        <input 
          type="text" 
          placeholder={t('forum_search_placeholder')}
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="search-input"
        />
      </header>
      
      <div className="new-question-form">
        <h3>{t('forum_create_new')}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t('forum_topic_placeholder')}
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            className="forum-input"
            disabled={uploading}
          />
          <textarea
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            placeholder={t('forum_question_placeholder')}
            rows={4}
            className="forum-textarea"
            disabled={uploading}
          />
          <input
            type="text"
            placeholder={t('forum_tags_placeholder')}
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            className="forum-input"
            disabled={uploading}
          />
          <div className="form-actions">
            <input
                type="file"
                id="file-question"
                className="file-input"
                accept=".doc,.docx,.pdf,image/png,image/jpeg"
                onChange={handleQuestionFileChange}
                disabled={uploading}
            />
            <label htmlFor="file-question" className="file-input-label">
                📎 {fileToUpload ? fileToUpload.name : t('forum_attach_file')}
            </label>
            <button type="submit" disabled={uploading} className="btn btn-primary">
                {uploading ? t('forum_publishing') : t('forum_publish_btn')}
            </button>
          </div>
        </form>
      </div>

      <ul className="questions-list">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map(q => (
            <QuestionItem 
                key={q.id}
                q={q}
                answers={answers}
                newAnswer={newAnswer}
                setNewAnswer={setNewAnswer}
                answerFiles={answerFiles}
                uploading={uploading}
                handleAddAnswer={handleAddAnswer}
                handleVoteQuestion={handleVoteQuestion}
                handleVoteAnswer={handleVoteAnswer}
                handleDeleteQuestion={handleDeleteQuestion}
                handleAnswerFileChange={handleAnswerFileChange} 
            />
          ))
        ) : <p className="no-questions">{t('forum_not_found')}</p>}
      </ul>
    </div>
  );
}