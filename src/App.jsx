import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SlotsPage } from './pages/SlotsPage';
import { SlotDetailPage } from './pages/SlotDetailPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { PlayerPOVPage } from './pages/PlayerPOVPage';
import { ListPage } from './pages/ListPage';
import { UploadPage } from './pages/UploadPage';
import { MigrationPage } from './pages/MigrationPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<SlotsPage />} />
                    <Route path="slots/:slotId" element={<SlotDetailPage />} />
                    <Route path="slots/:slotId/matches/:matchId" element={<MatchDetailPage />} />
                    <Route path="slots/:slotId/matches/:matchId/players/:playerName" element={<PlayerPOVPage />} />
                    <Route path="all-povs" element={<ListPage />} />
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="migrate" element={<MigrationPage />} />
                </Route>
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
