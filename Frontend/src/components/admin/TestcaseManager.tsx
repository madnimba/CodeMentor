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
  test1: string;
  output1: string;
  test2: string;
  output2: string;
  test3: string;
  output3: string;
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
    test1: '',
    output1: '',
    test2: '',
    output2: '',
    test3: '',
    output3: ''
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
          test1: '[1, 2, 3, 4, 5]',
          output1: '15',
          test2: '[10, 20, 30]',
          output2: '60',
          test3: '[1, 1, 1, 1, 1]',
          output3: '5'
        },
        {
          id: 2,
          test1: '[1, 2, 3]',
          output1: '6',
          test2: '[10, 20]',
          output2: '30',
          test3: '[1, 2, 3, 4, 5]',
          output3: '15'
        }
      ]);
    } catch (error) {
      toast.error('Failed to fetch testcases');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestcase = async () => {
    if (!newTestcase.test1 || !newTestcase.output1) {
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
        test1: '',
        output1: '',
        test2: '',
        output2: '',
        test3: '',
        output3: ''
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
                  <Label className="text-slate-200">Test 1 Input</Label>
                  <Textarea
                    placeholder="Test case input"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.test1}
                    onChange={(e) => setNewTestcase({...newTestcase, test1: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Test 1 Output</Label>
                  <Textarea
                    placeholder="Expected output"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.output1}
                    onChange={(e) => setNewTestcase({...newTestcase, output1: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200">Test 2 Input</Label>
                  <Textarea
                    placeholder="Test case input"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.test2}
                    onChange={(e) => setNewTestcase({...newTestcase, test2: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Test 2 Output</Label>
                  <Textarea
                    placeholder="Expected output"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.output2}
                    onChange={(e) => setNewTestcase({...newTestcase, output2: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-200">Test 3 Input</Label>
                  <Textarea
                    placeholder="Test case input"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.test3}
                    onChange={(e) => setNewTestcase({...newTestcase, test3: e.target.value})}
                  />
                </div>
                <div>
                  <Label className="text-slate-200">Test 3 Output</Label>
                  <Textarea
                    placeholder="Expected output"
                    className="bg-slate-600 border-slate-500 text-white"
                    value={newTestcase.output3}
                    onChange={(e) => setNewTestcase({...newTestcase, output3: e.target.value})}
                  />
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
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Testcase {testcase.id}
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
                        <Label className="text-slate-400 text-sm">Test 1 Input</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.test1}
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Test 1 Output</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.output1}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-slate-400 text-sm">Test 2 Input</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.test2}
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Test 2 Output</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.output2}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label className="text-slate-400 text-sm">Test 3 Input</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.test3}
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Test 3 Output</Label>
                        <div className="mt-1 p-2 bg-slate-800 rounded border border-slate-600 text-white text-sm font-mono">
                          {testcase.output3}
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
                    <Label className="text-slate-200">Test 1 Input</Label>
                    <Textarea
                      placeholder="Test case input"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.test1}
                      onChange={(e) => setEditingTestcase({...editingTestcase, test1: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Test 1 Output</Label>
                    <Textarea
                      placeholder="Expected output"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.output1}
                      onChange={(e) => setEditingTestcase({...editingTestcase, output1: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Test 2 Input</Label>
                    <Textarea
                      placeholder="Test case input"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.test2}
                      onChange={(e) => setEditingTestcase({...editingTestcase, test2: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Test 2 Output</Label>
                    <Textarea
                      placeholder="Expected output"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.output2}
                      onChange={(e) => setEditingTestcase({...editingTestcase, output2: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Test 3 Input</Label>
                    <Textarea
                      placeholder="Test case input"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.test3}
                      onChange={(e) => setEditingTestcase({...editingTestcase, test3: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Test 3 Output</Label>
                    <Textarea
                      placeholder="Expected output"
                      className="bg-slate-600 border-slate-500 text-white"
                      value={editingTestcase.output3}
                      onChange={(e) => setEditingTestcase({...editingTestcase, output3: e.target.value})}
                    />
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