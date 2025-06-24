// delivery-app/src/pages/PlanPage.tsx
// This component provides the UI to trigger the AI planning agent
// and display its results.
// Now requires an authentication token.

import  { useState } from 'react';
import type { PlanningResult } from '../interfaces';
import { runPlanningAgent } from '../api'; // Use function that accepts token
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PlanPageProps {
    showMessage: (msg: string, type?: 'info' | 'success' | 'error') => void;
    authToken: string; // NEW: Requires auth token
}

const PlanPage = ({ showMessage, authToken }:PlanPageProps) => {
    const [planningLoading, setPlanningLoading] = useState<boolean>(false);
    const [planningResults, setPlanningResults] = useState<PlanningResult | null>(null);

    const handlePlan = async () => {
        setPlanningLoading(true);
        setPlanningResults(null); // Clear previous results
        try {
            const data = await runPlanningAgent(authToken); // Pass token
            setPlanningResults(data);
            showMessage('Planning initiated successfully!', 'success');
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Error during planning:', err);
            showMessage(`Error during planning: ${err.message}`, 'error');
        } finally {
            setPlanningLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">AI Planning & Assignment</CardTitle>
                    <CardDescription className="text-gray-600">
                        Click the button below to trigger the AI planning agent. It will attempt to assign unassigned deliveries to available riders and generate optimized routes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Button
                        onClick={handlePlan}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={planningLoading}
                    >
                        {planningLoading ? 'Planning in Progress...' : 'Run AI Planning'}
                    </Button>
                </CardContent>
            </Card>

            {planningResults && (
                <Card className="p-6">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-xl font-semibold text-gray-800">Planning Results</CardTitle>
                        <CardDescription>{planningResults.message}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {planningResults.assignments && planningResults.assignments.length > 0 ? (
                            <div className="mt-4">
                                <p className="font-medium text-green-700 mb-2">
                                    {planningResults.assignments.length} deliveries assigned:
                                </p>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Delivery ID</TableHead>
                                                <TableHead>Rider ID</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Est. Time</TableHead>
                                                <TableHead>Distance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {planningResults.assignments.map((assignment, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{assignment.delivery_id}</TableCell>
                                                    <TableCell>{assignment.rider_id}</TableCell>
                                                    <TableCell className="text-sm">{assignment.reason}</TableCell>
                                                    <TableCell>{assignment.route_details.estimated_time_minutes} mins</TableCell>
                                                    <TableCell>{assignment.route_details.distance_km} km</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600">No new assignments were made.</p>
                        )}

                        {planningResults.unassigned_deliveries && planningResults.unassigned_deliveries.length > 0 && (
                            <div className="mt-4">
                                <p className="font-medium text-yellow-700">Unassigned Delivery IDs:</p>
                                <ul className="list-disc list-inside text-gray-600">
                                    {planningResults.unassigned_deliveries.map((id, index) => <li key={index}>{id}</li>)}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PlanPage;
