# 🎯 Exam Quick Reference Card

## 📋 What You Need to Do

1. **Add a new database table** (JPA Entity)
2. **Create API endpoints** (Controller + Service + Repository)
3. **Build a React page** to interact with the API
4. **Test the full flow** (Create, Read, Update, Delete)

---

## 🔧 Backend Files to Create (In Order)

### 1. Domain Entity (Database Table)
```java
// Backend/src/main/java/com/codementor/domain/YourEntity.java
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
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 2. Repository (Data Access)
```java
// Backend/src/main/java/com/codementor/repository/YourEntityRepository.java
@Repository
public interface YourEntityRepository extends JpaRepository<YourEntity, Integer> {
    List<YourEntity> findByUserId(Integer userId);
}
```

### 3. DTOs (Request/Response)
```java
// Backend/src/main/java/com/codementor/dto/yourfeature/CreateYourEntityRequest.java
@Data
public class CreateYourEntityRequest {
    @NotBlank(message = "Name is required")
    private String name;
}

// Backend/src/main/java/com/codementor/dto/yourfeature/YourEntityResponse.java
@Data
public class YourEntityResponse {
    private Integer id;
    private String name;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
```

### 4. Service (Business Logic)
```java
// Backend/src/main/java/com/codementor/service/YourEntityService.java
@Service
@RequiredArgsConstructor
public class YourEntityService {
    private final YourEntityRepository repository;
    private final UserRepository userRepository;
    
    @Transactional
    public YourEntityResponse create(CreateYourEntityRequest request) {
        User currentUser = getCurrentUser();
        YourEntity entity = new YourEntity();
        entity.setName(request.getName());
        entity.setUser(currentUser);
        return mapToResponse(repository.save(entity));
    }
    
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
```

### 5. Controller (REST API)
```java
// Backend/src/main/java/com/codementor/controller/YourEntityController.java
@RestController
@RequestMapping("/your-entities")
@RequiredArgsConstructor
public class YourEntityController {
    private final YourEntityService service;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<YourEntityResponse>> create(
            @Valid @RequestBody CreateYourEntityRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.create(request)));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<YourEntityResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }
}
```

---

## 🎨 Frontend Files to Create

### 1. API Service
```typescript
// Frontend/src/services/yourEntity.ts
export interface YourEntity {
  id: number;
  name: string;
  createdByUsername: string;
  createdAt: string;
}

export const yourEntityService = {
  async create(data: { name: string }): Promise<YourEntity> {
    const response = await api.post('/your-entities', data);
    return response.data.data;
  },
  
  async getAll(): Promise<YourEntity[]> {
    const response = await api.get('/your-entities');
    return response.data.data;
  },
};
```

### 2. React Page
```tsx
// Frontend/src/pages/YourEntity.tsx
const YourEntityPage = () => {
  const [entities, setEntities] = useState<YourEntity[]>([]);
  
  useEffect(() => {
    loadEntities();
  }, []);
  
  const loadEntities = async () => {
    try {
      const data = await yourEntityService.getAll();
      setEntities(data);
    } catch (err) {
      console.error('Failed to load entities:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <Header />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Your Entities</h1>
          {/* Add your UI here */}
        </div>
      </div>
      <Footer />
    </div>
  );
};
```

---

## 🚀 Quick Start Commands

### Backend
```bash
cd Backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd Frontend
npm run dev
```

---

## 🔍 Testing Checklist

- [ ] Backend starts without errors
- [ ] Database table is created
- [ ] API endpoints respond (test with Postman/curl)
- [ ] Frontend loads without errors
- [ ] Can create new entities
- [ ] Can view existing entities
- [ ] Can update entities
- [ ] Can delete entities

---

## 🚨 Common Mistakes to Avoid

1. **Missing annotations** - `@Entity`, `@Service`, `@RestController`
2. **Wrong imports** - Check existing files for correct imports
3. **Authentication issues** - Add `@PreAuthorize("isAuthenticated()")`
4. **CORS errors** - Backend has global CORS config
5. **Styling issues** - Follow existing dark theme patterns

---

## 📞 Emergency Help

If you get stuck:
1. **Check existing files** - Copy patterns from Article, User, etc.
2. **Use the templates** - They show exact structure needed
3. **Check console errors** - Both browser and backend logs
4. **Verify database** - Check if table was created

**Remember**: Start simple, test each step, and build incrementally! 🍀 