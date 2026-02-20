import React from 'react';
import { useSamples } from '../features/expressions/hooks';

function SamplesPage() {
  const { data: samples = [], isFetching, isError, error, refetch } = useSamples();

  return (
    <div className="section">
      <div className="section__header">
        <h2 className="section__title">Sample Expressions</h2>
        <div className="grid__buttons">
          <button type="button" className="button button--primary" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </button>
        </div>
      </div>

      {isError && <div className="message message--error">{error?.message ?? 'Failed to load samples'}</div>}
      {isFetching && <div className="message message--loading">Loading...</div>}

      {samples.length === 0 && !isFetching ? (
        <p className="message message--empty">No sample expressions available</p>
      ) : (
        <ul className="list list--items">
          {samples.map((item) => (
            <li key={item.id} className="card--item">
              <div className="card--item__expression">{item.expressionText}</div>
              <div className="card--item__result">{item.result}</div>
              <div className="card--item__time">
                {new Date(item.computedTime).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SamplesPage;
