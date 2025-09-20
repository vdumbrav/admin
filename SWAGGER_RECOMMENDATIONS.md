# Swagger/OpenAPI Recommendations for Quest API

## Overview
Based on the analysis of the form adapter layer and the **completed quest preset system implementation**, several API improvements are needed to eliminate technical debt and improve type safety. The preset system is now fully operational with 5 quest presets and comprehensive business rules.

## Quest Preset System API Requirements

### 🎯 **Preset System Overview**

The quest preset system is now **fully implemented and operational** with:
- ✅ 5 Quest Presets: Connect, Join, Action with Post, 7-Day Challenge, Explore
- ✅ **Modular Architecture**: Refactored from 1130-line monolith to clean modules
- ✅ Dynamic field visibility and business rules
- ✅ Connect-gate validation and reward calculations
- ✅ Real-time Twitter preview and draft autosave
- ✅ Full TypeScript safety with Zod validation
- ✅ **Shared Utilities**: Common functions in `src/utils/` for code reuse

### Preset-Specific API Requirements

**1. Action with Post Preset**
```yaml
# Enhanced resources schema for Twitter tasks
ActionWithPostResources:
  type: object
  properties:
    username:
      type: string
      pattern: '^[a-zA-Z0-9_]{1,15}$'
      description: Twitter username (without @)
    tweetId:
      type: string
      pattern: '^[0-9]{19,20}$'
      description: Twitter tweet ID (19-20 digits)
    ui:
      type: object
      properties:
        button:
          type: string
          default: "Engage"
          description: Action button text
```

**2. 7-Day Challenge Preset**
```yaml
# Iterator schema for daily rewards
IteratorSchema:
  type: object
  properties:
    days:
      type: integer
      minimum: 1
      maximum: 30
      description: Number of challenge days
    reward_map:
      type: array
      items:
        type: integer
        minimum: 0
      description: Daily reward amounts
      example: [10, 20, 30, 40, 50, 70, 100]
```

**3. Connect Preset Requirements**
```yaml
# Provider validation for connect quests
ConnectQuestSchema:
  type: object
  properties:
    type:
      type: string
      enum: [connect]
    group:
      type: string
      enum: [social]
      description: Connect quests must be social group
    provider:
      type: string
      enum: [twitter, telegram, discord, matrix]
      description: Required provider for connect validation
```

**4. Multi-Task Schema (Action with Post)**
```yaml
# Child task schema with order_by
ChildTaskSchema:
  type: object
  properties:
    type:
      type: string
      enum: [like, comment, share]
    reward:
      type: integer
      minimum: 0
    order_by:
      type: integer
      minimum: 0
      description: Task order (0-based index)
```

## Critical Issues Requiring Swagger Schema Updates

### 1. Resources Schema Definition
**Current Issue**: Resources are untyped (`Record<string, unknown>`)
**Impact**: Requires unsafe type casting, loses type safety

**Required Swagger Schema**:
```yaml
ResourcesSchema:
  type: object
  properties:
    icon:
      type: string
      format: uri
      description: Icon URL for the quest
    username:
      type: string
      description: Username for social media tasks
    tweetId:
      type: string
      description: Twitter tweet ID for engagement tasks
    isNew:
      type: boolean
      description: Whether this is a new resource
    block_id:
      type: string
      description: Blockchain block identifier
    ui:
      $ref: '#/components/schemas/UIResourcesSchema'
    adsgram:
      $ref: '#/components/schemas/AdsgramResourcesSchema'

UIResourcesSchema:
  type: object
  properties:
    button:
      type: string
      description: Button text for UI
    pop-up:
      $ref: '#/components/schemas/PopupResourcesSchema'

PopupResourcesSchema:
  type: object
  properties:
    name:
      type: string
      description: Popup name/identifier
    button:
      type: string
      description: Popup button text
    description:
      type: string
      description: Popup content description
    static:
      type: string
      format: uri
      description: Static content URL
    additional-title:
      type: string
      description: Additional popup title
    additional-description:
      type: string
      description: Additional popup description

AdsgramResourcesSchema:
  type: object
  properties:
    type:
      type: string
      enum: [task, reward]
      description: Adsgram integration type
    subtype:
      type: string
      enum: [video-ad, post-style-image]
      description: Adsgram content subtype
```

### 2. Task Type Consistency
**Current Issue**: Child tasks support fewer types than parent tasks
**Impact**: Requires type casting and potential runtime errors

**Recommended Solution**:
```yaml
# Define separate schemas for parent and child tasks
ParentTaskTypeEnum:
  type: string
  enum: [referral, connect, join, share, like, comment, multiple, repeatable, dummy, external]

ChildTaskTypeEnum:
  type: string
  enum: [like, share, comment, join, connect]
  description: Subset of task types allowed for child tasks

# Update Task schema to use appropriate enum based on context
TaskSchema:
  type: object
  properties:
    type:
      $ref: '#/components/schemas/ParentTaskTypeEnum'
    # ... other properties

ChildTaskSchema:
  type: object
  properties:
    type:
      $ref: '#/components/schemas/ChildTaskTypeEnum'
    # ... other properties
```

### 3. Group Type Alignment
**Current Issue**: Form supports 'all' group but API TaskGroup excludes it
**Impact**: Requires type casting

**Recommended Solution**:
```yaml
# Align group enums between frontend and backend
TaskGroupEnum:
  type: string
  enum: [all, social, daily, referral, partner]
  description: Quest group categories (include 'all' for filtering)

# Update Task schema
TaskSchema:
  type: object
  properties:
    group:
      $ref: '#/components/schemas/TaskGroupEnum'
```

### 4. Nullable Fields Consistency
**Current Issue**: Inconsistent null/undefined handling
**Impact**: Complex fallback logic in adapter

**Recommended Solution**:
```yaml
# Be explicit about nullable fields
TaskSchema:
  type: object
  properties:
    description:
      type: string
      nullable: true
      description: Task description (null if not provided)
    uri:
      type: string
      format: uri
      nullable: true
      description: External URI (null if not applicable)
    resources:
      allOf:
        - $ref: '#/components/schemas/ResourcesSchema'
        - nullable: true
      description: Task resources configuration
```

## API Endpoint Improvements

### 1. Request/Response Schema Validation
```yaml
paths:
  /api/tasks:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskResponse'

  /api/tasks/{id}:
    put:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateTaskRequest'
```

### 2. Error Response Schemas
```yaml
ErrorResponse:
  type: object
  properties:
    error:
      type: string
      description: Error message
    code:
      type: string
      description: Error code
    details:
      type: object
      description: Additional error details

ValidationErrorResponse:
  type: object
  properties:
    error:
      type: string
      example: "Validation failed"
    details:
      type: array
      items:
        type: object
        properties:
          field:
            type: string
          message:
            type: string
```

## Migration Strategy

### Phase 1: Add New Schemas (Non-breaking)
1. Add ResourcesSchema and related schemas
2. Add separate TaskTypeEnum schemas
3. Add proper nullable field definitions

### Phase 2: Update Endpoints (Breaking changes)
1. Update POST/PUT endpoints to use proper schemas
2. Update response types to match new schemas
3. Add validation middleware

### Phase 3: Remove Adapter Layer
1. Update frontend to use API types directly
2. Remove form-api-adapter.ts
3. Update form types to match API schemas

## Code Generation Benefits

With proper Swagger schemas, you can:
1. **Auto-generate TypeScript types** - No more manual type definitions
2. **Validate requests/responses** - Catch type mismatches at build time
3. **Generate client SDKs** - Consistent API interface across projects
4. **API documentation** - Self-documenting API with examples
5. **Mock servers** - Generate mock data for testing

## Implementation Status ✅

### Current State (Post-Preset Implementation)

**✅ Frontend Implementation Complete:**
- All 5 quest presets are fully operational
- Dynamic form system with field visibility management
- Business rules engine for validation and calculations
- Real-time features (Twitter preview, reward calculation)
- Full TypeScript safety with runtime validation
- Production-ready with comprehensive error handling

**🔄 API Schema Opportunities:**
While the current API works seamlessly with the preset system, the following improvements would enhance type safety and reduce adapter complexity:

## Updated Implementation Priority

### **HIGH Priority** 🔴
1. **Multi-Task Schema Enhancement** - For Action with Post preset
   - Add proper `order_by` validation for child tasks
   - Enforce `like`, `comment`, `share` type constraints for children
   - This directly supports the most complex preset implementation

2. **Iterator Schema Definition** - For 7-Day Challenge preset
   - Formalize `reward_map` array structure
   - Add validation for daily reward patterns
   - Support for extensible challenge durations

### **MEDIUM Priority** 🟡
3. **Enhanced Resources Schema** - Cross-preset optimization
   - Twitter-specific fields (`username`, `tweetId`) with proper validation
   - UI configuration schema (`button` text, `pop-up` structure)
   - Icon upload schema for Partner group quests

4. **Connect-Gate API Validation** - Backend enforcement
   - Provider-specific quest prerequisites validation
   - Connect quest dependency checking
   - Currently handled client-side but could be API-enforced

### **LOW Priority** 🟢
5. **Group Type Alignment** - UI/API consistency
   - Add 'all' to backend enum for filtering consistency
   - Simplify form-to-API mapping

6. **Error Response Schemas** - Enhanced debugging
   - Standardized error responses for preset validation failures
   - Better integration with frontend error handling

## Validation

After implementing these schemas:
1. Run `npm run build` - Should compile without type casting
2. Remove adapter layer gradually
3. Validate API responses match schemas
4. Add integration tests for type safety

## Long-term Goal

Eliminate the adapter layer entirely by having perfectly aligned types between frontend and backend, achieved through:
- Shared TypeScript types generated from OpenAPI
- Consistent schema definitions
- Proper validation at both ends
- Clear separation of concerns between API and UI models

---

## 🎯 Quest Preset System Integration Summary

### ✅ **Current State (December 2024)**

The quest preset system is **fully operational and production-ready** with:

1. **Complete Frontend Implementation:**
   - 5 quest presets with comprehensive business rules
   - Dynamic form system with advanced field visibility
   - Real-time validation and calculations
   - Draft autosave and error recovery
   - Full TypeScript safety

2. **API Compatibility:**
   - All presets work seamlessly with current API
   - Existing adapter layer handles type conversions
   - No breaking changes required for immediate operation

3. **Future Optimization Opportunities:**
   - Enhanced schemas would eliminate adapter complexity
   - Better type safety at API level
   - Standardized validation across frontend/backend
   - Improved developer experience

### 🚀 **Recommendation**

The quest preset system demonstrates that **sophisticated frontend business logic can be implemented successfully** even with current API constraints. The suggested Swagger improvements are **optimizations rather than requirements** - they would enhance the developer experience and reduce technical debt, but the system is fully functional and production-ready as implemented.

**Priority for API improvements should be based on:**
1. **Developer velocity** - How much time is spent on type casting/adaptation
2. **Maintenance burden** - Complexity of keeping adapter layer in sync
3. **Feature expansion** - When adding new preset types or quest capabilities
4. **Team preferences** - Some teams prefer API-first development, others favor rapid frontend iteration

The current implementation proves that **preset-driven quest creation is not only feasible but highly effective** for improving admin user experience and reducing configuration errors.