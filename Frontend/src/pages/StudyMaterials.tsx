import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Code2, Database, BookOpen, ChevronRight, ChevronDown } from "lucide-react";
import { studyMaterialService, Track, Topic, Subtopic } from "@/services/studyMaterials";
import { toast } from "sonner";

const StudyMaterials = () => {
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [topics, setTopics] = useState<{ [key: number]: Topic[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tracksData = await studyMaterialService.getAllTracks();
        setTracks(tracksData);
        
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
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg w-fit mx-auto mb-4">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Study Materials</h1>
            <p className="text-slate-400">Explore our comprehensive collection of programming topics</p>
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

      <Footer />
    </div>
  );
};

export default StudyMaterials;
