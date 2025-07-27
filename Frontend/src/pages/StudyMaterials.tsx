import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, Database, BookOpen, ChevronRight, ChevronDown, Plus, X } from "lucide-react";
import { studyMaterialService, Track, Topic, Subtopic, JobRole, CreateArticleRequest } from "@/services/studyMaterials";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const StudyMaterials = () => {
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [topics, setTopics] = useState<{ [key: number]: Topic[] }>({});
  const [subtopics, setSubtopics] = useState<{ [key: number]: Subtopic[] }>({});
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJobRoles, setSelectedJobRoles] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  const form = useForm<CreateArticleRequest>({
    defaultValues: {
      title: "",
      content: "",
      trackId: 0,
      topicId: 0,
      subtopicId: undefined,
      jobRoleIds: [],
    },
  });

  const selectedTrackId = form.watch("trackId");
  const selectedTopicId = form.watch("topicId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tracksData, jobRolesData] = await Promise.all([
          studyMaterialService.getAllTracks(),
          studyMaterialService.getAllJobRoles()
        ]);
        
        setTracks(tracksData);
        setJobRoles(jobRolesData);
        
        // Fetch topics for each track
        const topicsData: { [key: number]: Topic[] } = {};
        for (const track of tracksData) {
          const trackTopics = await studyMaterialService.getTopicsByTrackId(track.id);
          topicsData[track.id] = trackTopics;
        }
        setTopics(topicsData);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load study materials");
        toast.error("Failed to load study materials");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch subtopics when topic is selected
  useEffect(() => {
    if (selectedTopicId && selectedTopicId > 0) {
      const fetchSubtopics = async () => {
        try {
          const subtopicsData = await studyMaterialService.getSubtopicsByTopicId(selectedTopicId);
          setSubtopics(prev => ({ ...prev, [selectedTopicId]: subtopicsData }));
        } catch (err) {
          console.error("Failed to fetch subtopics:", err);
        }
      };
      fetchSubtopics();
    }
  }, [selectedTopicId]);

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleJobRoleToggle = (jobRoleId: number) => {
    setSelectedJobRoles(prev => 
      prev.includes(jobRoleId)
        ? prev.filter(id => id !== jobRoleId)
        : [...prev, jobRoleId]
    );
  };

  const onSubmit = async (data: CreateArticleRequest) => {
    if (!user) {
      toast.error("You must be logged in to create an article");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        ...data,
        jobRoleIds: selectedJobRoles,
        questionIds: [], // Leave empty as requested
      };

      await studyMaterialService.createArticle(requestData);
      toast.success("Article created successfully! It will be reviewed before publication.");
      setIsDialogOpen(false);
      form.reset();
      setSelectedJobRoles([]);
    } catch (err) {
      toast.error("Failed to create article. Please try again.");
      console.error("Failed to create article:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-slate-400 mt-4">Loading study materials...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
        <Header />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg w-fit mx-auto mb-4">
                <Code2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Study Materials</h1>
              <p className="text-slate-400">Explore our comprehensive collection of programming topics</p>
            </div>
            
            {/* Create Article Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    if (!user) {
                      toast.error("Please log in to create an article");
                      return;
                    }
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Article
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {tracks.map((track) => (
              <Card key={track.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSubject(track.id.toString())}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`bg-${track.id % 2 === 0 ? 'blue' : 'purple'}-600 p-2 rounded-lg`}>
                        {track.id % 2 === 0 ? <Database className="w-6 h-6 text-white" /> : <Code2 className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <CardTitle className="text-white">{track.name}</CardTitle>
                        <p className="text-sm text-slate-400">
                          {topics[track.id]?.length || 0} topics • {track.progress}% complete
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Progress value={track.progress} className="w-20" />
                      {expandedSubjects.includes(track.id.toString()) ? 
                        <ChevronDown className="w-5 h-5 text-slate-400" /> : 
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      }
                    </div>
                  </div>
                </CardHeader>

                {expandedSubjects.includes(track.id.toString()) && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {topics[track.id]?.map((topic) => (
                        <div key={topic.id} className="border border-slate-700 rounded-lg p-4">
                          <div 
                            className="flex items-center justify-between cursor-pointer mb-2"
                            onClick={() => toggleTopic(topic.id.toString())}
                          >
                            <div className="flex items-center space-x-3">
                              <BookOpen className="w-5 h-5 text-slate-400" />
                              <div>
                                <h4 className="text-white font-medium">{topic.name}</h4>
                                <p className="text-sm text-slate-400">
                                  {topic.subtopics.length} subtopics • {topic.progress}% complete
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Progress value={topic.progress} className="w-20" />
                              {expandedTopics.includes(topic.id.toString()) ? 
                                <ChevronDown className="w-4 h-4 text-slate-400" /> : 
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              }
                            </div>
                          </div>

                          {expandedTopics.includes(topic.id.toString()) && (
                            <div className="mt-4 space-y-2">
                              {topic.subtopics.map((subtopic) => (
                                <Link
                                  key={subtopic.id}
                                  to={`/article/subtopic/${subtopic.id}`}
                                  className="block p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors duration-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-300">{subtopic.name}</span>
                                    {subtopic.isRead && (
                                      <span className="text-xs text-green-400">Completed</span>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Create Article Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        
        {user && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Article</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter article title"
                          className="bg-slate-700 border-slate-600 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  rules={{ required: "Content is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your article content here..."
                          className="bg-slate-700 border-slate-600 text-white min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trackId"
                  rules={{ required: "Track is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Track</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select a track" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {tracks.map((track) => (
                            <SelectItem key={track.id} value={track.id.toString()}>
                              {track.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topicId"
                  rules={{ required: "Topic is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Topic</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={field.value?.toString()}
                        disabled={!selectedTrackId || selectedTrackId === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {topics[selectedTrackId]?.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtopicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Subtopic (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} 
                        value={field.value?.toString()}
                        disabled={!selectedTopicId || selectedTopicId === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select a subtopic (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {subtopics[selectedTopicId]?.map((subtopic) => (
                            <SelectItem key={subtopic.id} value={subtopic.id.toString()}>
                              {subtopic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel className="text-slate-200">Job Roles (Optional)</FormLabel>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {jobRoles.map((jobRole) => (
                      <div
                        key={jobRole.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedJobRoles.includes(jobRole.id)
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                        }`}
                        onClick={() => handleJobRoleToggle(jobRole.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{jobRole.name}</span>
                          {selectedJobRoles.includes(jobRole.id) && (
                            <X className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? "Creating..." : "Create Article"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
};

export default StudyMaterials;
