import React, { useState } from 'react';
import { Database, Download, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { migrateToHierarchical, backupExistingData, validateMigration } from '../services/migrationService';

export function MigrationPage() {
    const [migrationStatus, setMigrationStatus] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const handleBackup = async () => {
        setIsProcessing(true);
        try {
            const result = await backupExistingData();
            if (result) {
                toast.success(`Backed up ${result.length} POVs`);
            }
        } catch (error) {
            console.error('Backup error:', error);
            toast.error('Backup failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMigrate = async () => {
        if (!confirm('This will migrate all existing POVs to the new hierarchical structure. Continue?')) {
            return;
        }

        setIsProcessing(true);
        setMigrationStatus(null);
        try {
            const result = await migrateToHierarchical();
            setMigrationStatus(result);

            if (result.success) {
                toast.success('Migration completed!');
                // Validate immediately
                handleValidate();
            } else {
                toast.error('Migration failed');
            }
        } catch (error) {
            console.error('Migration error:', error);
            toast.error('Migration error occurred');
            setMigrationStatus({ success: false, message: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleValidate = async () => {
        setIsProcessing(true);
        try {
            const result = await validateMigration();
            setValidationResult(result);

            if (result.valid) {
                toast.success('Validation passed!');
            } else {
                toast.warning('Validation issues detected');
            }
        } catch (error) {
            console.error('Validation error:', error);
            toast.error('Validation failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <Toaster position="top-right" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Data Migration
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Migrate existing POVs to the new hierarchical structure
                </p>
            </div>

            <div className="space-y-6">
                {/* Step 1: Backup */}
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Step 1: Backup Data
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Download a backup of your existing POVs
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleBackup}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Backup Now'}
                        </button>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 <strong>Recommended:</strong> Always backup before migrating to prevent data loss.
                        </p>
                    </div>
                </div>

                {/* Step 2: Migrate */}
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Step 2: Run Migration
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Migrate POVs to Slots → Matches → POVs structure
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleMigrate}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isProcessing ? 'Migrating...' : (
                                <>
                                    <ArrowRight className="w-4 h-4" />
                                    Migrate
                                </>
                            )}
                        </button>
                    </div>

                    {migrationStatus && (
                        <div className={`border rounded-lg p-4 ${migrationStatus.success
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-start gap-3">
                                {migrationStatus.success ? (
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                                )}
                                <div>
                                    <p className={`font-medium ${migrationStatus.success
                                        ? 'text-green-800 dark:text-green-300'
                                        : 'text-red-800 dark:text-red-300'
                                        }`}>
                                        {migrationStatus.success ? 'Migration Successful!' : 'Migration Failed'}
                                    </p>
                                    <p className={`text-sm mt-1 ${migrationStatus.success
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-red-700 dark:text-red-400'
                                        }`}>
                                        {migrationStatus.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 3: Validate */}
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Step 3: Validate
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Verify migration integrity
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleValidate}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? 'Validating...' : 'Validate'}
                        </button>
                    </div>

                    {validationResult && (
                        <div className={`border rounded-lg p-4 ${validationResult.valid
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            }`}>
                            <div className="space-y-2">
                                <p className={`font-medium ${validationResult.valid
                                    ? 'text-green-800 dark:text-green-300'
                                    : 'text-yellow-800 dark:text-yellow-300'
                                    }`}>
                                    {validationResult.message}
                                </p>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Slots:</span>
                                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                            {validationResult.totalSlots || 0}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Matches:</span>
                                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                            {validationResult.totalMatches || 0}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">POVs:</span>
                                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                                            {validationResult.totalPOVs || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-2">
                        📋 Migration Details
                    </h4>
                    <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-1 list-disc list-inside">
                        <li>All existing POVs will be moved to a "Legacy Uploads" slot</li>
                        <li>POVs will be grouped into matches by date</li>
                        <li>Comments and metadata will be preserved</li>
                        <li>Original data remains untouched until migration completes</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
