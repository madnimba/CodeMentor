
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, Clock, User, BookOpen, Code2, ExternalLink } from "lucide-react";
import { useState } from "react";

const Article = () => {
  const { slug } = useParams();
  const [upvotes, setUpvotes] = useState(42);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Mock article data - in real app, this would come from API
  const article = {
    title: "Array Fundamentals: The Building Blocks of Programming",
    content: `
# Understanding Arrays

Arrays are one of the most fundamental data structures in computer science. They provide a way to store multiple elements of the same type in a contiguous block of memory, making them incredibly efficient for certain operations.

## What is an Array?

An array is a collection of elements stored at contiguous memory locations. The idea is to store multiple items of the same type together. This makes it easier to calculate the position of each element by simply adding an offset to a base value.

## Key Characteristics

### 1. Fixed Size
In most programming languages, arrays have a fixed size that must be declared at the time of creation. This size cannot be changed during runtime.

### 2. Homogeneous Elements
Arrays can only store elements of the same data type. You cannot mix integers and strings in the same array.

### 3. Random Access
Arrays provide O(1) random access to elements. You can access any element directly using its index.

### 4. Cache Friendly
Due to their contiguous memory layout, arrays are cache-friendly and provide excellent performance for sequential access patterns.

## Common Operations

### Accessing Elements
\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};
int firstElement = arr[0];  // Access first element
int lastElement = arr[4];   // Access last element
\`\`\`

### Insertion
Inserting elements in an array can be expensive as it might require shifting existing elements.

### Deletion
Similar to insertion, deletion might require shifting elements to maintain contiguity.

### Searching
Linear search in an array takes O(n) time, while binary search in a sorted array takes O(log n).

## Time Complexity

| Operation | Time Complexity |
|-----------|----------------|
| Access    | O(1)           |
| Search    | O(n)           |
| Insertion | O(n)           |
| Deletion  | O(n)           |

## Best Practices

1. **Initialize arrays properly** to avoid garbage values
2. **Check bounds** before accessing elements to prevent overflow
3. **Use appropriate data types** to optimize memory usage
4. **Consider using dynamic arrays** (like vectors in C++) when size varies

## Real-world Applications

Arrays are used in:
- Image processing (pixels as 2D arrays)
- Mathematical computations (matrices)
- Database indexing
- Implementing other data structures

Understanding arrays is crucial as they form the foundation for more complex data structures like stacks, queues, and hash tables.
    `,
    author: "Dr. Rashid Ahmed",
    publishedAt: "2024-01-15",
    readTime: "8 min read",
    tags: ["Arrays", "Data Structures", "Fundamentals"],
    difficulty: "Beginner"
  };

  const relatedArticles = [
    { title: "Two Pointers Technique", slug: "two-pointers", difficulty: "Intermediate" },
    { title: "Dynamic Arrays vs Static Arrays", slug: "dynamic-vs-static", difficulty: "Beginner" },
    { title: "Array Sorting Algorithms", slug: "array-sorting", difficulty: "Intermediate" }
  ];

  const relatedProblems = [
    { title: "Two Sum", difficulty: "Easy", company: "Pridesys IT" },
    { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", company: "Brain Station" },
    { title: "Container With Most Water", difficulty: "Medium", company: "IQVIA" },
    { title: "Trapping Rain Water", difficulty: "Hard", company: "Therap BD" }
  ];

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button asChild variant="ghost" className="mb-6 text-slate-300 hover:text-white">
            <Link to="/study-materials">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Study Materials
            </Link>
          </Button>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {tag}
                </Badge>
              ))}
              <Badge className={`${
                article.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                article.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {article.difficulty}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-6 text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
              <span>{article.publishedAt}</span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleUpvote}
                variant="outline"
                className={`border-slate-600 ${hasUpvoted ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'text-slate-300'} hover:bg-slate-800`}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                {upvotes} Upvotes
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardContent className="p-8">
              <div className="prose prose-invert prose-purple max-w-none">
                <div className="text-slate-200 leading-relaxed space-y-6">
                  {article.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-4">{paragraph.slice(2)}</h1>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-2xl font-semibold text-purple-300 mt-6 mb-3">{paragraph.slice(3)}</h2>;
                    }
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="text-xl font-medium text-slate-200 mt-4 mb-2">{paragraph.slice(4)}</h3>;
                    }
                    if (paragraph.startsWith('```')) {
                      return <pre key={index} className="bg-slate-900 p-4 rounded-lg overflow-x-auto"><code className="text-cyan-300">{paragraph.slice(3)}</code></pre>;
                    }
                    if (paragraph.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="mb-4">{paragraph}</p>;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Related Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {relatedArticles.map((related, index) => (
                  <Link
                    key={index}
                    to={`/article/${related.slug}`}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                  >
                    <div>
                      <h4 className="text-white font-medium">{related.title}</h4>
                      <Badge className={`mt-1 text-xs ${
                        related.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {related.difficulty}
                      </Badge>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Problems */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Related Problems
              </CardTitle>
              <CardDescription className="text-slate-400">
                Practice what you've learned with these coding problems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {relatedProblems.map((problem, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="text-white font-medium">{problem.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${
                          problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {problem.difficulty}
                        </Badge>
                        <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30 text-xs">
                          {problem.company}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                      Solve
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Article;
