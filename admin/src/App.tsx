import { Provider } from 'react-redux';
import { store } from './features/store';
import AppRouter from './routes';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;
