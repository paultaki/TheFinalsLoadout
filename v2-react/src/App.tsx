import { GameProvider } from './context/GameProvider';
import { LoadoutHistoryProvider } from './context/LoadoutHistoryContext';
import GameFlow from './components/GameFlow';

/**
 * Main application component that provides game context and renders the game flow
 */
function App() {
  return (
    <LoadoutHistoryProvider>
      <GameProvider>
        <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
          <div className="max-w-full px-2 sm:px-4 lg:px-8">
            <GameFlow />
          </div>
        </div>
      </GameProvider>
    </LoadoutHistoryProvider>
  );
}

export default App;
