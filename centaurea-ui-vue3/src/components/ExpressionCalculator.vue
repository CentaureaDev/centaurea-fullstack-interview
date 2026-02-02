<template>
  <div class="expression-container">
    <h1>Expression Calculator (Vue3)</h1>

    <div class="tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'calculator' }"
        @click="activeTab = 'calculator'"
      >
        Calculator
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'samples' }"
        @click="() => { activeTab = 'samples'; fetchSamples(); }"
      >
        Samples
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'history' }"
        @click="fetchHistory"
      >
        History
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading" class="loading">Loading...</div>

    <div v-if="activeTab === 'calculator'" class="calculator-section">
      <form @submit.prevent="handleCalculate" class="calculator-form">
        <div class="form-group">
          <label>First Operand:</label>
          <input
            v-model.number="firstOperand"
            type="number"
            step="any"
            placeholder="Enter first number"
            required
          />
        </div>

        <div class="form-group">
          <label>Operation:</label>
          <select v-model.number="operation">
            <option
              v-for="[key, name] in Object.entries(OperationNames)"
              :key="key"
              :value="parseInt(key)"
            >
              {{ name }} ({{ OperationSymbols[key] }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Second Operand:</label>
          <input
            v-model.number="secondOperand"
            type="number"
            step="any"
            placeholder="Enter second number"
            required
          />
        </div>

        <button type="submit" class="calculate-btn">Calculate</button>
      </form>

      <div v-if="result" class="result-card">
        <h2>Result</h2>
        <p class="expression-string">{{ result.expressionString }}</p>
        <div class="result-details">
          <p><strong>Operation:</strong> {{ OperationNames[result.operation] }}</p>
          <p><strong>Result:</strong> {{ result.result }}</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'samples'" class="samples-section">
      <button @click="fetchSamples" :disabled="loading">Refresh Samples</button>
      <div class="samples-grid">
        <div v-for="(item, index) in samples" :key="index" class="sample-card">
          <h3>{{ OperationNames[item.operation] }}</h3>
          <p class="expression">
            {{ item.firstOperand }} {{ item.operationSymbol }} {{ item.secondOperand }}
          </p>
          <p class="result">= {{ item.result }}</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'history'" class="history-section">
      <button @click="handleClearHistory" class="clear-btn">Clear History</button>
      <table v-if="history.length > 0" class="history-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Operation</th>
            <th>First</th>
            <th>Second</th>
            <th>Result</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td>{{ formatDate(item.computedTime) }}</td>
            <td>{{ OperationNames[item.operation] }}</td>
            <td>{{ item.firstOperand }}</td>
            <td>{{ item.secondOperand }}</td>
            <td><strong>{{ item.result }}</strong></td>
            <td>{{ item.userIdentifier }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">No history available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { expressionService, OperationType, OperationSymbols, OperationNames } from '../services/expressionService';

const samples = ref([]);
const history = ref([]);
const loading = ref(false);
const error = ref(null);
const activeTab = ref('calculator');

// Calculator state
const firstOperand = ref('');
const secondOperand = ref('');
const operation = ref(OperationType.Addition);
const result = ref(null);

const fetchSamples = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await expressionService.getSamples();
    samples.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await expressionService.getHistory(100);
    history.value = data;
    activeTab.value = 'history';
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleCalculate = async () => {
  error.value = null;
  result.value = null;

  if (isNaN(firstOperand.value) || isNaN(secondOperand.value)) {
    error.value = 'Please enter valid numbers';
    return;
  }

  try {
    const data = await expressionService.calculate(operation.value, firstOperand.value, secondOperand.value);
    result.value = data;
  } catch (err) {
    error.value = err.message;
  }
};

const handleClearHistory = async () => {
  if (window.confirm('Are you sure you want to clear all history?')) {
    try {
      await expressionService.clearHistory();
      history.value = [];
      alert('History cleared successfully');
    } catch (err) {
      error.value = err.message;
    }
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

onMounted(() => {
  fetchSamples();
});
</script>

<style scoped>
.expression-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}

.expression-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #333;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.error {
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.calculator-section,
.samples-section,
.history-section {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Calculator Form */
.calculator-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
}

.calculate-btn {
  width: 100%;
  padding: 12px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.calculate-btn:hover {
  background-color: #218838;
}

/* Result Card */
.result-card {
  max-width: 500px;
  margin: 30px auto 0;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: white;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 24px;
}

.expression-string {
  font-size: 28px;
  font-weight: 700;
  margin: 20px 0;
  text-align: center;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.result-details p {
  margin: 10px 0;
  font-size: 16px;
}

/* Samples Grid */
.samples-section button {
  padding: 10px 20px;
  margin-bottom: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.samples-section button:hover {
  background-color: #0056b3;
}

.samples-section button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.samples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.sample-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: white;
}

.sample-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.sample-card h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.sample-card .expression {
  font-size: 24px;
  font-weight: 600;
  margin: 10px 0;
  text-align: center;
}

.sample-card .result {
  font-size: 28px;
  font-weight: 700;
  margin: 10px 0;
  text-align: center;
  color: #fff;
}

/* History Table */
.history-section button {
  padding: 10px 20px;
  margin-bottom: 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.history-section button:hover {
  background-color: #c82333;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.history-table thead {
  background-color: #007bff;
  color: white;
}

.history-table th,
.history-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.history-table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.history-table tbody tr:hover {
  background-color: #f5f5f5;
}

.history-table tbody tr:last-child td {
  border-bottom: none;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 18px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .samples-grid {
    grid-template-columns: 1fr;
  }

  .history-table {
    font-size: 14px;
  }

  .history-table th,
  .history-table td {
    padding: 8px 10px;
  }
}
</style>
