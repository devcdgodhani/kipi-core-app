import { Provider } from 'react-redux';
import { store } from './features/store';
import AppRouter from './router/AppRouter';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;
