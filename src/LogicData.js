import React, { useEffect, useState } from 'react';

function LogicData() {
  const [logicItems, setLogicItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/logic')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => setLogicItems(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div>Помилка: {error}</div>;
  }

  return (
    <div>
      <h2>Logic Items</h2>
      <ul>
        {logicItems.map((item) => (
          <li key={item._id}>
            <strong>Expression:</strong> {item.expression} <br />
            <strong>Result:</strong> {item.result}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LogicData;
