# 🚀 CodeMentor Full-Stack Feature Development Guide

## 📋 Overview

This guide walks you through adding a complete new feature to your Spring Boot + React application. The project follows a **layered architecture** with clear separation of concerns.

## 🏗️ Architecture Flow

```
Frontend (React) → API Service → Backend Controller → Service → Repository → Database
```

## 📁 Project Structure

### Backend (Spring Boot)
```
Backend/src/main/java/com/codementor/
├── domain/           # JPA Entities (Database tables)
├── repository/       # Data Access Layer
├── service/          # Business Logic
├── controller/       # REST API Endpoints
├── dto/             # Data Transfer Objects
│   ├── request/     # Incoming data validation
│   └── response/    # Outgoing data formatting
└── exception/       # Custom exceptions
```

### Frontend (React)
```
Frontend/src/
├── pages/           # Route components
├── services/        # API calls
├── components/      # Reusable UI components
└── contexts/        # State management
```

---

## 🔧 Step-by-Step Feature Development

### **Step 1: Plan Your Feature**
1. **Define the entity/table** you want to create
2. **List the fields** your entity needs
3. **Plan the relationships** with existing entities
4. **Define the API endpoints** you'll need

### **Step 2: Backend Development**

#### **2.1 Create Domain Entity** (Database Table)
- **File**: `Backend/src/main/java/com/codementor/domain/YourEntity.java`
- **Purpose**: Defines the database table structure
- **Template**: Use `TemplateEntity.java` as reference

**Key Points:**
- Use `@Entity` annotation
- Add `@Table(name = "your_table_name")`
- Use `@Column` for field mappings
- Add relationships with `@ManyToOne`, `@OneToMany`, etc.
- Include `@PrePersist` and `@PreUpdate` for timestamps

**Example:**
```java
@Entity
@Table(name = "your_entities")
public class YourEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private String name;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
```

#### **2.2 Create Repository** (Data Access)
- **File**: `Backend/src/main/java/com/codementor/repository/YourEntityRepository.java`
- **Purpose**: Handles database operations
- **Template**: Use `TemplateEntityRepository.java` as reference

**Key Points:**
- Extend `JpaRepository<YourEntity, Integer>`
- Add custom query methods
- Use `@Query` for complex queries
- Include pagination support

#### **2.3 Create DTOs** (Data Transfer Objects)
- **Request DTO**: `Backend/src/main/java/com/codementor/dto/yourfeature/CreateYourEntityRequest.java`
- **Response DTO**: `Backend/src/main/java/com/codementor/dto/yourfeature/YourEntityResponse.java`
- **Purpose**: Validate incoming data and format outgoing data

**Key Points:**
- Use validation annotations (`@NotBlank`, `@NotNull`)
- Keep DTOs separate from entities
- Include only necessary fields

#### **2.4 Create Service** (Business Logic)
- **File**: `Backend/src/main/java/com/codementor/service/YourEntityService.java`
- **Purpose**: Contains all business logic
- **Template**: Use `TemplateEntityService.java` as reference

**Key Points:**
- Use `@Service` annotation
- Inject repositories with `@RequiredArgsConstructor`
- Add `@Transactional` for database operations
- Handle authentication and authorization
- Map entities to DTOs

#### **2.5 Create Controller** (REST API)
- **File**: `Backend/src/main/java/com/codementor/controller/YourEntityController.java`
- **Purpose**: Exposes REST endpoints
- **Template**: Use `TemplateEntityController.java` as reference

**Key Points:**
- Use `@RestController` and `@RequestMapping`
- Add `@PreAuthorize` for security
- Return `ApiResponse<T>` wrapper
- Handle validation with `@Valid`

### **Step 3: Frontend Development**

#### **3.1 Create API Service**
- **File**: `Frontend/src/services/yourEntity.ts`
- **Purpose**: Handles API calls to backend
- **Template**: Use `templateEntity.ts` as reference

**Key Points:**
- Define TypeScript interfaces
- Use the existing `api` instance
- Handle errors consistently
- Support pagination

#### **3.2 Create Page Component**
- **File**: `Frontend/src/pages/YourEntity.tsx`
- **Purpose**: Main UI for the feature
- **Template**: Use `TemplateEntity.tsx` as reference

**Key Points:**
- Use existing UI components from `@/components/ui/`
- Follow the dark theme styling
- Include Header and Footer
- Handle loading and error states
- Add search and pagination

#### **3.3 Add Route** (Optional)
- **File**: `Frontend/src/App.tsx` or your router configuration
- **Purpose**: Make the page accessible via URL

---

## 🎯 Quick Start Example

Let's say you want to add a "**Notes**" feature where users can create and manage study notes.

### **Step 1: Backend - Create Note Entity**

```java
// Backend/src/main/java/com/codementor/domain/Note.java
@Entity
@Table(name = "notes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### **Step 2: Backend - Create Repository**

```java
// Backend/src/main/java/com/codementor/repository/NoteRepository.java
@Repository
public interface NoteRepository extends JpaRepository<Note, Integer> {
    List<Note> findByUserId(Integer userId);
    Page<Note> findByUserId(Integer userId, Pageable pageable);
}
```

### **Step 3: Backend - Create DTOs**

```java
// Backend/src/main/java/com/codementor/dto/note/CreateNoteRequest.java
@Data
public class CreateNoteRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String content;
}

// Backend/src/main/java/com/codementor/dto/note/NoteResponse.java
@Data
public class NoteResponse {
    private Integer id;
    private String title;
    private String content;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
```

### **Step 4: Backend - Create Service**

```java
// Backend/src/main/java/com/codementor/service/NoteService.java
@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public NoteResponse createNote(CreateNoteRequest request) {
        User currentUser = getCurrentUser();
        
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setUser(currentUser);
        
        Note savedNote = noteRepository.save(note);
        return mapToNoteResponse(savedNote);
    }
    
    // Add other methods...
}
```

### **Step 5: Backend - Create Controller**

```java
// Backend/src/main/java/com/codementor/controller/NoteController.java
@RestController
@RequestMapping("/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @Valid @RequestBody CreateNoteRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            noteService.createNote(request)
        ));
    }
    
    // Add other endpoints...
}
```

### **Step 6: Frontend - Create API Service**

```typescript
// Frontend/src/services/note.ts
export interface Note {
  id: number;
  title: string;
  content: string;
  createdByUsername: string;
  createdAt: string;
}

export const noteService = {
  async create(data: { title: string; content: string }): Promise<Note> {
    const response = await api.post('/notes', data);
    return response.data.data;
  },
  
  async getAll(): Promise<Note[]> {
    const response = await api.get('/notes');
    return response.data.data;
  },
  
  // Add other methods...
};
```

### **Step 7: Frontend - Create Page**

```tsx
// Frontend/src/pages/Notes.tsx
const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  
  useEffect(() => {
    loadNotes();
  }, []);
  
  const loadNotes = async () => {
    try {
      const data = await noteService.getAll();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">My Notes</h1>
          {/* Add your UI components here */}
        </div>
      </div>
      <Footer />
    </div>
  );
};
```

---

## 🔍 Testing Your Feature

### **Backend Testing**
1. **Unit Tests**: Test your service methods
2. **Integration Tests**: Test your controller endpoints
3. **Database**: Verify your entity is created correctly

### **Frontend Testing**
1. **API Calls**: Test your service functions
2. **UI**: Test your page component
3. **Integration**: Test the full flow

### **Manual Testing**
1. Start your backend: `./mvnw spring-boot:run`
2. Start your frontend: `npm run dev`
3. Navigate to your new page
4. Test CRUD operations

---

## 🚨 Common Issues & Solutions

### **Backend Issues**
- **Entity not found**: Check `@Entity` and `@Table` annotations
- **Validation errors**: Check DTO validation annotations
- **Authentication errors**: Verify `@PreAuthorize` and JWT setup
- **Database connection**: Check `application.yml` configuration

### **Frontend Issues**
- **API calls failing**: Check CORS configuration and API base URL
- **Authentication**: Verify JWT token is being sent
- **Styling**: Follow the existing dark theme patterns
- **State management**: Use React hooks properly

---

## 📚 Additional Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **React Docs**: https://react.dev/
- **JPA/Hibernate**: https://hibernate.org/orm/
- **Tailwind CSS**: https://tailwindcss.com/

---

## 🎯 Exam Tips

1. **Start with the database entity** - this is the foundation
2. **Follow the existing patterns** - don't reinvent the wheel
3. **Test incrementally** - build and test each layer
4. **Use the templates** - they show the exact structure needed
5. **Keep it simple** - focus on core functionality first
6. **Document your changes** - comment your code

Good luck with your exam! 🍀 