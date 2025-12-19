import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ListPage } from './pages/ListPage';
import { UploadPage } from './pages/UploadPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<ListPage />} />
                    <Route path="upload" element={<UploadPage />} />
                    {/* Add more routes here if needed */}
                </Route>
            </Routes>
        </ErrorBoundary>
    );
}

export default App;
