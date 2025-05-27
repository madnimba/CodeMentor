
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, BookOpen, Code2, Database, Cpu, Brain, Settings, CheckCircle, Circle } from "lucide-react";
import { Link } from "react-router-dom";

interface SubTopic {
  id: string;
  title: string;
  isRead: boolean;
  articleSlug: string;
}

interface Topic {
  id: string;
  title: string;
  progress: number;
  subtopics: SubTopic[];
}

interface Subject {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  progress: number;
  topics: Topic[];
}

const StudyMaterials = () => {
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);

  const jobRoles = [
    "Software Engineer",
    "Database Engineer", 
    "Machine Learning Engineer",
    "System Engineer"
  ];

  const subjects: Subject[] = [
    {
      id: "dsa",
      title: "Data Structures & Algorithms",
      icon: Code2,
      color: "purple",
      progress: 65,
      topics: [
        {
          id: "arrays",
          title: "Arrays & Strings",
          progress: 80,
          subtopics: [
            { id: "array-basics", title: "Array Fundamentals", isRead: true, articleSlug: "array-fundamentals" },
            { id: "two-pointers", title: "Two Pointers Technique", isRead: true, articleSlug: "two-pointers" },
            { id: "sliding-window", title: "Sliding Window", isRead: false, articleSlug: "sliding-window" },
            { id: "string-manipulation", title: "String Manipulation", isRead: true, articleSlug: "string-manipulation" },
            { id: "string-matching", title: "String Matching Algorithms", isRead: false, articleSlug: "string-matching" },
            { id: "array-sorting", title: "Array Sorting Techniques", isRead: true, articleSlug: "array-sorting" },
            { id: "prefix-sum", title: "Prefix Sum Arrays", isRead: false, articleSlug: "prefix-sum" },
            { id: "kadane-algorithm", title: "Kadane's Algorithm", isRead: true, articleSlug: "kadane-algorithm" },
            { id: "boyer-moore", title: "Boyer-Moore Majority Vote", isRead: false, articleSlug: "boyer-moore" },
            { id: "dutch-flag", title: "Dutch National Flag Problem", isRead: false, articleSlug: "dutch-flag" }
          ]
        },
        {
          id: "linked-lists",
          title: "Linked Lists",
          progress: 60,
          subtopics: [
            { id: "singly-linked", title: "Singly Linked Lists", isRead: true, articleSlug: "singly-linked" },
            { id: "doubly-linked", title: "Doubly Linked Lists", isRead: true, articleSlug: "doubly-linked" },
            { id: "circular-linked", title: "Circular Linked Lists", isRead: false, articleSlug: "circular-linked" },
            { id: "ll-reversal", title: "Linked List Reversal", isRead: true, articleSlug: "ll-reversal" },
            { id: "ll-cycle", title: "Cycle Detection", isRead: false, articleSlug: "ll-cycle" },
            { id: "ll-merging", title: "Merging Linked Lists", isRead: true, articleSlug: "ll-merging" },
            { id: "ll-intersection", title: "Finding Intersection", isRead: false, articleSlug: "ll-intersection" },
            { id: "ll-palindrome", title: "Palindrome Check", isRead: false, articleSlug: "ll-palindrome" },
            { id: "ll-sorting", title: "Sorting Linked Lists", isRead: true, articleSlug: "ll-sorting" },
            { id: "ll-clone", title: "Cloning Complex Lists", isRead: false, articleSlug: "ll-clone" }
          ]
        },
        {
          id: "trees",
          title: "Trees & Binary Trees",
          progress: 45,
          subtopics: [
            { id: "binary-tree-basics", title: "Binary Tree Fundamentals", isRead: true, articleSlug: "binary-tree-basics" },
            { id: "tree-traversal", title: "Tree Traversal Methods", isRead: true, articleSlug: "tree-traversal" },
            { id: "bst", title: "Binary Search Trees", isRead: false, articleSlug: "bst" },
            { id: "avl-trees", title: "AVL Trees", isRead: false, articleSlug: "avl-trees" },
            { id: "tree-construction", title: "Tree Construction", isRead: true, articleSlug: "tree-construction" },
            { id: "lowest-common-ancestor", title: "Lowest Common Ancestor", isRead: false, articleSlug: "lca" },
            { id: "tree-diameter", title: "Tree Diameter", isRead: false, articleSlug: "tree-diameter" },
            { id: "tree-serialization", title: "Tree Serialization", isRead: false, articleSlug: "tree-serialization" },
            { id: "trie", title: "Trie Data Structure", isRead: true, articleSlug: "trie" },
            { id: "segment-trees", title: "Segment Trees", isRead: false, articleSlug: "segment-trees" }
          ]
        },
        {
          id: "graphs",
          title: "Graph Algorithms",
          progress: 30,
          subtopics: [
            { id: "graph-representation", title: "Graph Representation", isRead: true, articleSlug: "graph-representation" },
            { id: "bfs-dfs", title: "BFS and DFS", isRead: true, articleSlug: "bfs-dfs" },
            { id: "shortest-path", title: "Shortest Path Algorithms", isRead: false, articleSlug: "shortest-path" },
            { id: "topological-sort", title: "Topological Sorting", isRead: false, articleSlug: "topological-sort" },
            { id: "union-find", title: "Union-Find Data Structure", isRead: false, articleSlug: "union-find" },
            { id: "minimum-spanning-tree", title: "Minimum Spanning Tree", isRead: false, articleSlug: "mst" },
            { id: "graph-coloring", title: "Graph Coloring", isRead: false, articleSlug: "graph-coloring" },
            { id: "network-flow", title: "Network Flow", isRead: false, articleSlug: "network-flow" },
            { id: "strongly-connected", title: "Strongly Connected Components", isRead: false, articleSlug: "scc" },
            { id: "bipartite-graphs", title: "Bipartite Graphs", isRead: false, articleSlug: "bipartite-graphs" }
          ]
        },
        {
          id: "dynamic-programming",
          title: "Dynamic Programming",
          progress: 40,
          subtopics: [
            { id: "dp-basics", title: "DP Fundamentals", isRead: true, articleSlug: "dp-basics" },
            { id: "fibonacci-dp", title: "Fibonacci Sequence", isRead: true, articleSlug: "fibonacci-dp" },
            { id: "knapsack", title: "Knapsack Problem", isRead: false, articleSlug: "knapsack" },
            { id: "longest-subsequence", title: "Longest Common Subsequence", isRead: false, articleSlug: "lcs" },
            { id: "edit-distance", title: "Edit Distance", isRead: false, articleSlug: "edit-distance" },
            { id: "coin-change", title: "Coin Change Problem", isRead: true, articleSlug: "coin-change" },
            { id: "matrix-chain", title: "Matrix Chain Multiplication", isRead: false, articleSlug: "matrix-chain" },
            { id: "dp-on-trees", title: "DP on Trees", isRead: false, articleSlug: "dp-on-trees" },
            { id: "digit-dp", title: "Digit DP", isRead: false, articleSlug: "digit-dp" },
            { id: "bitmask-dp", title: "Bitmask DP", isRead: false, articleSlug: "bitmask-dp" }
          ]
        }
      ]
    },
    {
      id: "database",
      title: "Database Systems",
      icon: Database,
      color: "blue",
      progress: 55,
      topics: [
        {
          id: "sql-fundamentals",
          title: "SQL Fundamentals",
          progress: 75,
          subtopics: [
            { id: "basic-queries", title: "Basic SQL Queries", isRead: true, articleSlug: "basic-sql" },
            { id: "joins", title: "SQL Joins", isRead: true, articleSlug: "sql-joins" },
            { id: "subqueries", title: "Subqueries and CTEs", isRead: false, articleSlug: "subqueries" },
            { id: "window-functions", title: "Window Functions", isRead: true, articleSlug: "window-functions" },
            { id: "aggregate-functions", title: "Aggregate Functions", isRead: true, articleSlug: "aggregate-functions" },
            { id: "stored-procedures", title: "Stored Procedures", isRead: false, articleSlug: "stored-procedures" },
            { id: "triggers", title: "Database Triggers", isRead: false, articleSlug: "triggers" },
            { id: "views", title: "Database Views", isRead: true, articleSlug: "views" },
            { id: "indexes", title: "Database Indexes", isRead: false, articleSlug: "indexes" },
            { id: "constraints", title: "Database Constraints", isRead: true, articleSlug: "constraints" }
          ]
        },
        {
          id: "database-design",
          title: "Database Design",
          progress: 60,
          subtopics: [
            { id: "er-modeling", title: "ER Modeling", isRead: true, articleSlug: "er-modeling" },
            { id: "normalization", title: "Database Normalization", isRead: true, articleSlug: "normalization" },
            { id: "denormalization", title: "Denormalization", isRead: false, articleSlug: "denormalization" },
            { id: "schema-design", title: "Schema Design Patterns", isRead: true, articleSlug: "schema-design" },
            { id: "referential-integrity", title: "Referential Integrity", isRead: false, articleSlug: "referential-integrity" },
            { id: "partitioning", title: "Database Partitioning", isRead: false, articleSlug: "partitioning" },
            { id: "sharding", title: "Database Sharding", isRead: false, articleSlug: "sharding" },
            { id: "replication", title: "Database Replication", isRead: true, articleSlug: "replication" },
            { id: "backup-recovery", title: "Backup and Recovery", isRead: false, articleSlug: "backup-recovery" },
            { id: "migration-strategies", title: "Migration Strategies", isRead: false, articleSlug: "migration-strategies" }
          ]
        },
        {
          id: "nosql",
          title: "NoSQL Databases",
          progress: 40,
          subtopics: [
            { id: "document-databases", title: "Document Databases", isRead: true, articleSlug: "document-databases" },
            { id: "key-value-stores", title: "Key-Value Stores", isRead: false, articleSlug: "key-value-stores" },
            { id: "column-family", title: "Column Family Databases", isRead: false, articleSlug: "column-family" },
            { id: "graph-databases", title: "Graph Databases", isRead: true, articleSlug: "graph-databases" },
            { id: "mongodb", title: "MongoDB", isRead: true, articleSlug: "mongodb" },
            { id: "redis", title: "Redis", isRead: false, articleSlug: "redis" },
            { id: "cassandra", title: "Apache Cassandra", isRead: false, articleSlug: "cassandra" },
            { id: "elasticsearch", title: "Elasticsearch", isRead: false, articleSlug: "elasticsearch" },
            { id: "neo4j", title: "Neo4j", isRead: false, articleSlug: "neo4j" },
            { id: "cap-theorem", title: "CAP Theorem", isRead: true, articleSlug: "cap-theorem" }
          ]
        },
        {
          id: "performance",
          title: "Database Performance",
          progress: 35,
          subtopics: [
            { id: "query-optimization", title: "Query Optimization", isRead: true, articleSlug: "query-optimization" },
            { id: "execution-plans", title: "Execution Plans", isRead: false, articleSlug: "execution-plans" },
            { id: "indexing-strategies", title: "Indexing Strategies", isRead: true, articleSlug: "indexing-strategies" },
            { id: "caching", title: "Database Caching", isRead: false, articleSlug: "db-caching" },
            { id: "connection-pooling", title: "Connection Pooling", isRead: false, articleSlug: "connection-pooling" },
            { id: "load-balancing", title: "Database Load Balancing", isRead: false, articleSlug: "db-load-balancing" },
            { id: "monitoring", title: "Performance Monitoring", isRead: true, articleSlug: "db-monitoring" },
            { id: "profiling", title: "Database Profiling", isRead: false, articleSlug: "db-profiling" },
            { id: "tuning", title: "Database Tuning", isRead: false, articleSlug: "db-tuning" },
            { id: "scaling", title: "Database Scaling", isRead: false, articleSlug: "db-scaling" }
          ]
        },
        {
          id: "transactions",
          title: "Transactions & ACID",
          progress: 50,
          subtopics: [
            { id: "acid-properties", title: "ACID Properties", isRead: true, articleSlug: "acid-properties" },
            { id: "transaction-isolation", title: "Transaction Isolation Levels", isRead: true, articleSlug: "isolation-levels" },
            { id: "concurrency-control", title: "Concurrency Control", isRead: false, articleSlug: "concurrency-control" },
            { id: "locking", title: "Database Locking", isRead: true, articleSlug: "db-locking" },
            { id: "deadlocks", title: "Deadlock Prevention", isRead: false, articleSlug: "deadlocks" },
            { id: "mvcc", title: "Multi-Version Concurrency Control", isRead: false, articleSlug: "mvcc" },
            { id: "two-phase-commit", title: "Two-Phase Commit", isRead: false, articleSlug: "two-phase-commit" },
            { id: "distributed-transactions", title: "Distributed Transactions", isRead: false, articleSlug: "distributed-transactions" },
            { id: "consistency-models", title: "Consistency Models", isRead: true, articleSlug: "consistency-models" },
            { id: "eventual-consistency", title: "Eventual Consistency", isRead: false, articleSlug: "eventual-consistency" }
          ]
        }
      ]
    }
  ];

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

  const getColorClasses = (color: string) => {
    const colors = {
      purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      blue: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      green: "text-green-400 border-green-500/30 bg-green-500/10",
      orange: "text-orange-400 border-orange-500/30 bg-orange-500/10",
      pink: "text-pink-400 border-pink-500/30 bg-pink-500/10"
    };
    return colors[color as keyof typeof colors] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Study Materials
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Master the fundamentals with our comprehensive study tracks designed for different engineering roles
            </p>
            
            {/* Job Role Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {jobRoles.map((role) => (
                <Badge key={role} className="bg-slate-800/50 text-slate-300 border-slate-600 px-4 py-2 hover:bg-slate-700/50 cursor-pointer">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="space-y-6">
            {subjects.map((subject) => (
              <Card key={subject.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getColorClasses(subject.color)}`}>
                        <subject.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">{subject.title}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {subject.topics.length} topics • {subject.progress}% complete
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">Progress</div>
                        <Progress value={subject.progress} className="w-24" />
                      </div>
                      {expandedSubjects.includes(subject.id) ? 
                        <ChevronDown className="w-5 h-5 text-slate-400" /> : 
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      }
                    </div>
                  </div>
                </CardHeader>

                {expandedSubjects.includes(subject.id) && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {subject.topics.map((topic) => (
                        <div key={topic.id} className="border border-slate-700 rounded-lg p-4">
                          <div 
                            className="flex items-center justify-between cursor-pointer mb-2"
                            onClick={() => toggleTopic(topic.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <BookOpen className="w-5 h-5 text-slate-400" />
                              <div>
                                <h4 className="text-white font-medium">{topic.title}</h4>
                                <p className="text-sm text-slate-400">
                                  {topic.subtopics.length} subtopics • {topic.progress}% complete
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Progress value={topic.progress} className="w-20" />
                              {expandedTopics.includes(topic.id) ? 
                                <ChevronDown className="w-4 h-4 text-slate-400" /> : 
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              }
                            </div>
                          </div>

                          {expandedTopics.includes(topic.id) && (
                            <div className="ml-8 space-y-2 mt-4">
                              {topic.subtopics.map((subtopic) => (
                                <Link
                                  key={subtopic.id}
                                  to={`/article/${subtopic.articleSlug}`}
                                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    {subtopic.isRead ? 
                                      <CheckCircle className="w-4 h-4 text-green-400" /> : 
                                      <Circle className="w-4 h-4 text-slate-500" />
                                    }
                                    <span className={`text-sm ${subtopic.isRead ? 'text-slate-300' : 'text-slate-400'}`}>
                                      {subtopic.title}
                                    </span>
                                  </div>
                                  <Badge className={`text-xs ${subtopic.isRead ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-600/20 text-slate-400 border-slate-600/30'}`}>
                                    {subtopic.isRead ? 'Read' : 'Unread'}
                                  </Badge>
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
