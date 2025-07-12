import axios from "axios";

const JUDGE0_API_URL = "/code-editor"; // Proxied through nginx

export interface CodeExecutionRequest {
  code: string;
  language: string;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: string;
  execution_time?: number;
  memory_used?: number;
}

export interface ServerHealth {
  status: string;
  message: string;
  queueLength: number;
  activeExecutions: number;
}

class Judge0Service {
  private api = axios.create({
    baseURL: JUDGE0_API_URL,
    timeout: 30000, // 30 seconds timeout
  });

  // Check server health
  async checkHealth(): Promise<ServerHealth> {
    try {
      const response = await this.api.get("/health");
      return response.data;
    } catch (error) {
      throw new Error("Server is not available");
    }
  }

  // Execute code
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      const response = await this.api.post("/run", request);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || "Execution failed";
        throw new Error(errorMessage);
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. Please try again.");
      } else {
        throw new Error("Network error. Please check your connection.");
      }
    }
  }

  // Get supported languages
  getSupportedLanguages() {
    return [
      { id: "javascript", name: "JavaScript", extension: "js" },
      { id: "python", name: "Python", extension: "py" },
      { id: "cpp", name: "C++", extension: "cpp" },
      { id: "java", name: "Java", extension: "java" },
      { id: "c", name: "C", extension: "c" },
      { id: "csharp", name: "C#", extension: "cs" },
      { id: "php", name: "PHP", extension: "php" },
      { id: "ruby", name: "Ruby", extension: "rb" },
      { id: "swift", name: "Swift", extension: "swift" },
      { id: "go", name: "Go", extension: "go" },
      { id: "rust", name: "Rust", extension: "rs" },
      { id: "kotlin", name: "Kotlin", extension: "kt" },
    ];
  }

  // Get language by ID
  getLanguageById(id: string) {
    return this.getSupportedLanguages().find(lang => lang.id === id);
  }

  // Get Monaco editor language mapping
  getMonacoLanguage(languageId: string): string {
    const languageMap: { [key: string]: string } = {
      javascript: "javascript",
      python: "python",
      cpp: "cpp",
      java: "java",
      c: "c",
      csharp: "csharp",
      php: "php",
      ruby: "ruby",
      swift: "swift",
      go: "go",
      rust: "rust",
      kotlin: "kotlin",
    };
    return languageMap[languageId] || "javascript";
  }
}

export const judge0Service = new Judge0Service(); 