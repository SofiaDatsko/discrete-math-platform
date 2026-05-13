import React from 'react';
import { useTranslation } from 'react-i18next'; 
import './VennPractice.css';

export function VennTheory() {
  const { t } = useTranslation(); 

  return (
    <div className="theory-container">
      {/* Заголовок секції */}
      <h2>📘 {t('venn_theory_title')}</h2>
      <p>{t('venn_theory_desc')}</p>

      {/* Основні операції */}
      <h4>{t('venn_operations_header')}</h4>
      <ul>
        <li><strong>{t('venn_op_union')}:</strong> {t('venn_op_union_desc')}</li>
        <li><strong>{t('venn_op_intersection')}:</strong> {t('venn_op_intersection_desc')}</li>
        <li><strong>{t('venn_op_difference')}:</strong> {t('venn_op_difference_desc')}</li>
        <li><strong>{t('venn_op_complement')}:</strong> {t('venn_op_complement_desc')}</li>
      </ul>

      {/* Приклад */}
      <h4>{t('venn_example_header')}</h4>
      <p>{t('venn_example_sets', { a: '{1,2,3}', b: '{3,4,5}' })}</p>
      <ul>
        <li>A ∪ B = {'{1,2,3,4,5}'}</li>
        <li>A ∩ B = {'{3}'}</li>
        <li>A \ B = {'{1,2}'}</li>
      </ul>
    </div>
  );
}