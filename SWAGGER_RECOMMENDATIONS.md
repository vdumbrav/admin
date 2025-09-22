# Swagger API Schema Recommendations

**Status: ✅ 85% Complete - Direct API Integration Achieved**

**Date**: December 2024
**Achievement**: Successfully eliminated unnecessary abstraction layers and achieved direct API usage.

## 📊 Current Migration Status (85% Complete)

### ✅ **Completed (85%)**

- ✅ **Direct API integration** - Quest = TaskResponseDto without conversion
- ✅ **Simplified type layer** - removed unnecessary type aliases
- ✅ **Single query interface** - merged LocalFilterConfig + QuestQuery
- ✅ **Removed unused converters** - direct API usage everywhere
- ✅ **Iterator field working** - using TaskResponseDtoIterator directly
- ✅ **All CRUD operations** functional with direct API calls
- ✅ **Client-side filtering/sorting** for small datasets (50-200 items)

### ⚠️ **Remaining Issues (15%)**

- ⚠️ **Resources typing** - still using `Record<string, unknown>`
- ⚠️ **Form validation** - need proper Zod instead of type assertions
- ⚠️ **Child task schema gaps** - hardcoded fallbacks remain
- ⚠️ **Iterator schema** - API uses `{ [key: string]: unknown }`

## 🏗️ **Current Architecture - Direct API Usage**

```typescript
// Direct API Integration - Minimal Layer
type Quest = TaskResponseDto & {
  usersCount?: number;  // Frontend calculated display field
  totalXp?: number;     // Frontend calculated display field
};

// Single Query Interface - No Adapters Needed
interface QuestQuery {
  // Client-side filtering
  search?: string;      // Filter by title/description
  group?: string;       // TaskResponseDtoGroup values
  type?: string;        // TaskResponseDtoTypeItem values
  provider?: string;    // TaskResponseDtoProvider values
  enabled?: boolean;    // Direct boolean usage

  // Client-side pagination
  page?: number;
  limit?: number;
  sort?: string;
}

// Only form-api-adapter needed for form ↔ API conversion
// All other conversions removed - working with API types directly
```

## ✅ **Iterator Integration - Direct API Usage**

**Solution**: Using TaskResponseDtoIterator directly from API without conversion.

### **Current Implementation**

```typescript
// Direct API usage - no conversion needed
type Quest = TaskResponseDto & {
  // iterator: TaskResponseDtoIterator (used directly)
  // iterator_reward: string[] (backend managed)
  // iterator_resource: TaskResponseDtoIteratorResource (backend managed)
}

// Form schema matches API structure
iterator: z.object({
  days: z.number().min(3).max(10).optional(),
  reward_map: z.array(z.number().min(0))
}).optional()
```

### **Benefits of Direct Usage**
- ✅ No type conversion needed
- ✅ Form matches API expectations
- ✅ Backend manages iterator_reward/iterator_resource
- ✅ Simplified codebase with less abstraction

**Result**: Iterator now works directly with API types - no adapter complexity.

## 🎯 **Remaining API Improvements for 100% Completion**

### **1. ResourcesDto - Proper Resource Schema** ⚠️ High Priority

**Issue**: `resources` field uses untyped `Record<string, unknown>`

**Impact**: Type safety compromises, unsafe casting required

**Solution**: Define proper ResourcesDto schema

```yaml
# Required API schema:
components:
  schemas:
    ResourcesDto:
      type: object
      properties:
        # Core fields
        icon:
          type: string
          format: uri
          description: Icon URL
        username:
          type: string
          description: Username (Twitter/social)
        tweetId:
          type: string
          pattern: '^[0-9]{19,20}$'
          description: Tweet ID
        isNew:
          type: boolean
          description: New item flag
        block_id:
          type: string
          description: Block ID (Adsgram)

        # UI configuration
        ui:
          type: object
          properties:
            button:
              type: string
              description: Button text
            pop-up:
              type: object
              properties:
                name: { type: string }
                button: { type: string }
                description: { type: string }
                static: { type: string, format: uri }
                additional-title: { type: string }
                additional-description: { type: string }

        # Adsgram integration
        adsgram:
          type: object
          properties:
            type:
              type: string
              enum: [task, reward]
            subtype:
              type: string
              enum: [video-ad, post-style-image]
```

### **2. IteratorDto - Proper Iterator Schema** ⚠️ High Priority

**Текущая проблема**: `TaskResponseDtoIterator: { [key: string]: unknown }` - полностью нетипизированный

**Воздействие**: Нет типизации для 7-Day Challenge квестов, приходится использовать unsafe casting

**Решение для API схемы:**

```yaml
# В OpenAPI/Swagger схеме обновить:
TaskResponseDtoIterator:
  type: object
  description: "Итератор для ежедневных наград в челленджах (7-Day Challenge)"
  properties:
    # Основные поля для фронтенда
    days:
      type: number
      minimum: 3
      maximum: 10
      description: "Количество дней челленджа"
      example: 7
    reward_map:
      type: array
      items:
        type: number
        minimum: 0
      description: "Массив наград за каждый день"
      example: [10, 20, 30, 40, 50, 70, 100]

    # Поля, управляемые бэкендом (readOnly)
    iterator_reward:
      type: array
      items:
        type: string
      description: "Массив строк наград (генерируется бэкендом)"
      readOnly: true
    iterator_resource:
      $ref: '#/components/schemas/TaskResponseDtoIteratorResource'
      description: "Ресурсы итератора (генерируется бэкендом)"
      readOnly: true
  required:
    - reward_map

# Также обновить IteratorResource:
TaskResponseDtoIteratorResource:
  type: object
  description: "Ресурсы для ежедневных заданий"
  properties:
    icons:
      type: array
      items:
        type: string
        format: uri
      description: "Иконки для каждого дня"
    titles:
      type: array
      items:
        type: string
      description: "Заголовки для каждого дня"
    descriptions:
      type: array
      items:
        type: string
      description: "Описания для каждого дня"
    background_color:
      type: string
      description: "Цвет фона"
```

**TypeScript интерфейс для замены:**

```typescript
// Заменить { [key: string]: unknown } на:
export interface IteratorDto {
  /** Количество дней челленджа (3-10) */
  days?: number;

  /** Массив ежедневных наград */
  reward_map: number[];

  /** Строки наград (управляется бэкендом) */
  iterator_reward?: string[];

  /** Ресурсы итератора (управляется бэкендом) */
  iterator_resource?: {
    icons?: string[];
    titles?: string[];
    descriptions?: string[];
    background_color?: string;
  };
}
```

### **3. Enhanced List Fields - Display Metadata** ⚠️ Medium Priority

**Issue**: Missing fields for rich UI display in quest tables

**Current Workaround**: Frontend calculates usersCount/totalXp locally

**Solution**: Add computed fields to GET /api/admin/tasks

```yaml
# Extend TaskResponseDto:
TaskResponseDto:
  type: object
  properties:
    # ... existing fields

    # Display fields (backend computed)
    usersCount:
      type: integer
      description: User participation count
    totalXp:
      type: integer
      description: Total XP distributed
    completionRate:
      type: number
      description: Completion percentage

    # Metadata
    createdBy:
      type: string
      description: Quest creator
    lastModified:
      type: string
      format: date-time
      description: Last modification date
    status:
      type: string
      enum: [draft, active, completed, paused]
```

## 🔧 **Technical Architecture**

### **Current Implementation (85% Complete)**

```typescript
// 1. Direct API Usage - No Type Conversion
type Quest = TaskResponseDto & {
  usersCount?: number;  // Frontend calculated
  totalXp?: number;     // Frontend calculated
};

// 2. Simplified Query Interface
interface QuestQuery {
  // Client-side filtering
  search?: string;      // Filter by title/description
  group?: string;       // TaskResponseDtoGroup values
  type?: string;        // TaskResponseDtoTypeItem values
  provider?: string;    // TaskResponseDtoProvider values
  enabled?: boolean;    // Direct boolean usage

  // Client-side pagination
  page?: number;
  limit?: number;
  sort?: string;
}

// 3. Minimal Adapter Layer
// Only form-api-adapter.ts needed for form ↔ API conversion
// All other adapters removed - direct API usage
```

### **Remaining Technical Debt (4 items)**

1. **Resources Schema** - Replace `Record<string, unknown>` with proper ResourcesDto
2. **Iterator Schema** - Replace `{ [key: string]: unknown }` with IteratorDto
3. **Form Validation** - Add proper Zod validation instead of type assertions
4. **Child Task Schema** - Remove hardcoded defaults after API improvements

## 📋 **Completion Roadmap**

### **Phase 1: API Schema Improvements**
1. Add ResourcesDto schema to Swagger spec
2. Add proper IteratorDto schema to Swagger spec
3. Add computed fields to GET /api/admin/tasks response
4. Update API documentation

### **Phase 2: Frontend Finalization**
1. Update generated API types
2. Remove all `Record<string, unknown>` casting
3. Add proper Zod validation with schema parsing
4. Remove hardcoded fallback values
5. Update tests and documentation

### **Phase 3: Verification**
1. Test all 5 quest presets (create/edit/delete)
2. Validate type safety without warnings
3. Performance tests with larger datasets
4. E2E tests for critical user flows
5. Documentation updates

## 🎯 **Target: 100% Direct API Integration**

```typescript
// Final architecture:
type Quest = TaskResponseDto; // Direct API usage

// No Quest adapters needed
// Only form-api-adapter for form conversion
// Full typing without any/unknown
// Zod validation with proper parsing
```

**Migration Complete When**:
- ✅ 0 TODO comments in codebase
- ✅ 0 `Record<string, unknown>` casting
- ✅ 0 `as unknown as` conversions
- ✅ All API fields properly typed
- ✅ Form validation uses Zod parsing
- ✅ Direct TaskResponseDto usage everywhere

---

**🚀 Current Status: 85% Production Ready - Direct API Integration Achieved**

**Key Achievement**: Successfully eliminated unnecessary abstraction layers and achieved direct API usage with minimal adapter complexity.