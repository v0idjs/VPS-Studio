
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { ServerList } from "./components/servers/ServerList";
import { ServerDetail } from "./components/servers/ServerDetail";
import { useAppStore } from "./stores/app-store";

function App() {
  const { servers, selectedServerId, selectServer, activeView, setActiveView } = useAppStore();
  const selectedServer = servers.find((s) => s.id === selectedServerId);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          {selectedServer ? (
            <ServerDetail
              server={selectedServer}
              onBack={() => selectServer(null)}
              activeTab={activeView}
              onTabChange={setActiveView}
            />
          ) : (
            <ServerList />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
