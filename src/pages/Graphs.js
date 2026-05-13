import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; 
import './Graphs.css';

const NODE_RADIUS = 20;

export default function Graphs() {
  const { t } = useTranslation(); 
  const [nodes, setNodes] = useState([]); 
  const [edges, setEdges] = useState([]); 
  const [mode, setMode] = useState('addNode'); 
  const [selectedNode, setSelectedNode] = useState(null);
  const [algorithmResult, setAlgorithmResult] = useState(''); 
  const canvasRef = useRef(null);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(n => Math.sqrt((n.x - x)**2 + (n.y - y)**2) < NODE_RADIUS);

    if (mode === 'addNode') {
      if (!clickedNode) {
        const id = nodes.length ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
        setNodes([...nodes, { id, x, y }]);
        setAlgorithmResult('');
      }
    } else if (mode === 'addEdge') {
      if (clickedNode) {
        if (!selectedNode) {
          setSelectedNode(clickedNode);
        } else if (selectedNode.id !== clickedNode.id) {
          const exists = edges.some(e => 
            (e.from === selectedNode.id && e.to === clickedNode.id) ||
            (e.to === selectedNode.id && e.from === clickedNode.id)
          );
          if (!exists) {
            setEdges([...edges, { from: selectedNode.id, to: clickedNode.id }]);
            setAlgorithmResult('');
          }
          setSelectedNode(null);
        }
      } else {
        setSelectedNode(null);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    edges.forEach(({ from, to }) => {
      const n1 = nodes.find(n => n.id === from);
      const n2 = nodes.find(n => n.id === to);
      if (n1 && n2) {
        ctx.beginPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      }
    });

    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#4f46e5';
      ctx.fill();

      if (selectedNode && selectedNode.id === node.id) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = '#312e81';
        ctx.lineWidth = 3;
      }
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y);
    });
  }, [nodes, edges, selectedNode]);

  const runAlgorithm = (algo) => {
    const startNodeId = document.getElementById('startNode').value;
    if (!startNodeId && algo !== 'hasCycle') {
        setAlgorithmResult(t('graph_error_start_node'));
        return;
    }
    const startId = Number(startNodeId);

    const adjList = {};
    nodes.forEach(n => adjList[n.id] = []);
    edges.forEach(e => {
        adjList[e.from].push(e.to);
        adjList[e.to].push(e.from);
    });

    let result = '';
    
    if (algo === 'bfs') {
        const visited = new Set();
        const queue = [startId];
        const order = [];
        while (queue.length) {
            const node = queue.shift();
            if (!visited.has(node)) {
                visited.add(node);
                order.push(node);
                adjList[node]?.forEach(n => {
                    if (!visited.has(n)) queue.push(n);
                });
            }
        }
        result = `${t('graph_res_bfs')}: ${order.join(' → ')}`;
    } else if (algo === 'dfs') {
        const visited = new Set();
        const order = [];
        const visit = (node) => {
            if (!visited.has(node)) {
                visited.add(node);
                order.push(node);
                adjList[node]?.forEach(n => visit(n));
            }
        };
        visit(startId);
        result = `${t('graph_res_dfs')}: ${order.join(' → ')}`;
    } else if (algo === 'hasCycle') {
        const visited = new Set();
        let cycleFound = false;
        const dfsCycle = (node, parent) => {
            visited.add(node);
            for (const neighbor of adjList[node]) {
                if (!visited.has(neighbor)) {
                    if (dfsCycle(neighbor, node)) return true;
                } else if (neighbor !== parent) {
                    return true;
                }
            }
            return false;
        };

        for (const node of nodes.map(n => n.id)) {
            if (!visited.has(node)) {
                if (dfsCycle(node, null)) {
                    cycleFound = true;
                    break;
                }
            }
        }
        result = cycleFound ? t('graph_res_cycle_yes') : t('graph_res_cycle_no');
    }
    setAlgorithmResult(result);
  };
  
  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setAlgorithmResult('');
  };

  return (
    <div className="graph-constructor">
      <div className="controls-panel">
        <h1>{t('graph_constructor')}</h1>
        <p>{t('graph_inst_desc')}</p>

        <div className="control-group">
          <h2>{t('work_mode')}</h2>
          <div className="mode-selector">
            <button className={`btn ${mode === 'addNode' ? 'active' : ''}`} onClick={() => setMode('addNode')}>
              📌 {t('add_node')}
            </button>
            <button className={`btn ${mode === 'addEdge' ? 'active' : ''}`} onClick={() => {setMode('addEdge'); setSelectedNode(null);}}>
              ↔️ {t('add_edge')}
            </button>
          </div>
        </div>

        <div className="control-group">
          <h2>{t('algorithms')}</h2>
          <select id="startNode" className="styled-select" defaultValue="">
            <option value="" disabled>{t('select_start_node')}</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{t('graph_node_label')} {n.id}</option>)}
          </select>
          <div className="algorithm-buttons">
            <button className="btn btn-algo" onClick={() => runAlgorithm('bfs')} disabled={!nodes.length}>▶️ {t('graph_btn_bfs')}</button>
            <button className="btn btn-algo" onClick={() => runAlgorithm('dfs')} disabled={!nodes.length}>▶️ {t('graph_btn_dfs')}</button>
            <button className="btn btn-algo" onClick={() => runAlgorithm('hasCycle')} disabled={!nodes.length}>🔄 {t('graph_btn_cycle')}</button>
          </div>
        </div>

        {algorithmResult && (
            <div className="results-display">
                <h4>{t('graph_res_label')}:</h4>
                <p>{algorithmResult}</p>
            </div>
        )}

        <div className="control-group utility-buttons">
            <button className="btn btn-clear" onClick={handleClear}>
                🗑️ {t('graph_btn_clear')}
            </button>
        </div>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef} className="graph-canvas" onClick={handleCanvasClick} />
      </div>
    </div>
  );
}