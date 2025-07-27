import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Testcase {
  id: number;
  input: string;
  expectedOutput: string;
  timeLimitMs: number;
  isPublic: boolean;
}

interface TestcaseManagerProps {
  questionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const TestcaseManager: React.FC<TestcaseManagerProps> = ({
  questionId,
  isOpen,
  onClose
}) => {
  const [testcases, setTestcases] = useState<Testcase[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTestcase, setEditingTestcase] = useState<Testcase | null>(null);
  const [newTestcase, setNewTestcase] = useState({
    input: '',
    expectedOutput: '',
    timeLimitMs: 1000,
    isPublic: false
  });

  useEffect(() => {
    if (isOpen) {
      fetchTestcases();
    }
  }, [isOpen, questionId]);

  const fetchTestcases = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch testcases
      // const response = await adminService.getQuestionTestcases(questionId);
      // setTestcases(response);
      
      // Mock data for now
      setTestcases([
        {
          id: 1,
          input: '[1, 2, 3, 4, 5]',
          expectedOutput: '15',
          timeLimitMs: 1000,
          isPublic: true
        },
        {
          id: 2,
          input: '[10, 20, 30]',
          expectedOutput: '60',
          timeLimitMs: 1000,
          isPublic: false
        }
      ]);
    } catch (error) {
      toast.error('Failed to fetch testcases');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestcase = async () => {
    if (!newTestcase.input || !newTestcase.expectedOutput) {
      toast.error('Input and expected output are required');
      return;
    }

    try {
      // TODO: Implement API call to add testcase
      // await adminService.addTestcase(questionId, newTestcase);
      
      const testcase: Testcase = {
        id: Date.now(), // Temporary ID
        ...newTestcase
      };
      
      setTestcases([...testcases, testcase]);
      setNewTestcase({
        input: '',
        expectedOutput: '',
        timeLimitMs: 1000,
        isPublic: false
      });
      toast.success('Testcase added successfully');
    } catch (error) {
      toast.error('Failed to add testcase');
    }
  };

  const handleUpdateTestcase = async () => {
    if (!editingTestcase) return;

    try {
      // TODO: Implement API call to update testcase
      // await adminService.updateTestcase(questionId, editingTestcase.id, editingTestcase);
      
      setTestcases(testcases.map(tc => 
        tc.id === editingTestcase.id ? editingTestcase : tc
      ));
      setEditingTestcase(null);
      toast.success('Testcase updated successfully');
    } catch (error) {
      toast.error('Failed to update testcase');
    }
  };

  const handleDeleteTestcase = async (testcaseId: number) => {
    if (!confirm('Are you sure you want to delete this testcase?')) {
      return;
    }

    try {
      // TODO: Implement API call to delete testcase
      // await adminService.deleteTestcase(questionId, testcaseId);
      
      setTestcases(testcases.filter(tc => tc.id !== testcaseId));
      toast.success('Testcase deleted successfully');
    } catch (error) {
      toast.error('Failed to delete testcase');
    }
  };

  const handleDeleteAllTestcases = async () => {
    if (!confirm('Are you sure you want to delete all testcases? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement API call to delete all testcases
      // await adminService.deleteAllTestcases(questionId);
      
      setTestcases([]);
      toast.success('All testcases deleted successfully');
    } catch (error) {
      toast.error('Failed to delete testcases');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Testcase Management - Question {questionId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Testcase */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-lg">Add New Testcase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200">Input</Label>
                  <Textarea
                    placeholder="Test case input"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.input}
                    onChange={(e) => setNewTestcase({...newTestcase, input: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Expected Output</Label>
                  <Textarea
                    placeholder="Expected output"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.expectedOutput}
                    onChange={(e) => setNewTestcase({...newTestcase, expectedOutput: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200">Time Limit (ms)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.timeLimitMs}
                    onChange={(e) => setNewTestcase({...newTestcase, timeLimitMs: Number(e.target.value)})}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-8">
                  <input
                    type="checkbox"
                    checked={newTestcase.isPublic}
                    onChange={(e) => setNewTestcase({...newTestcase, isPublic: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label className="text-slate-200">Public Test Case</Label>
                </div>
              </div>
              <Button
                onClick={handleAddTestcase}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Testcase
              </Button>
            </CardContent>
          </Card>

          {/* Existing Testcases */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">
                Existing Testcases ({testcases.length})
              </h3>
              <Button
                variant="outline"
                onClick={handleDeleteAllTestcases}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-slate-400 mt-2">Loading testcases...</p>
              </div>
            ) : testcases.length === 0 ? (
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No testcases found for this question.</p>
                </CardContent>
              </Card>
            ) : (
              testcases.map((testcase) => (
                <Card key={testcase.id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          testcase.isPublic 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }>
                          {testcase.isPublic ? "Public" : "Private"}
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {testcase.timeLimitMs}ms
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTestcase(testcase)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTestcase(testcase.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-400 text-sm">Input</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.input}
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Expected Output</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.expectedOutput}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Edit Testcase Dialog */}
        <Dialog open={!!editingTestcase} onOpenChange={() => setEditingTestcase(null)}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Testcase</DialogTitle>
            </DialogHeader>
            {editingTestcase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Input</Label>
                    <Textarea
                      placeholder="Test case input"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.input}
                      onChange={(e) => setEditingTestcase({...editingTestcase, input: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Expected Output</Label>
                    <Textarea
                      placeholder="Expected output"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.expectedOutput}
                      onChange={(e) => setEditingTestcase({...editingTestcase, expectedOutput: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Time Limit (ms)</Label>
                    <Input
                      type="number"
                      placeholder="1000"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.timeLimitMs}
                      onChange={(e) => setEditingTestcase({...editingTestcase, timeLimitMs: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-8">
                    <input
                      type="checkbox"
                      checked={editingTestcase.isPublic}
                      onChange={(e) => setEditingTestcase({...editingTestcase, isPublic: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label className="text-slate-200">Public Test Case</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTestcase(null)}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateTestcase}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update Testcase
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}; 