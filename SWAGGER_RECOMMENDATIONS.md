# Swagger/OpenAPI Recommendations for Quest API

## Overview
Based on the analysis of the form adapter layer, several API improvements are needed to eliminate technical debt and improve type safety.

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

## Implementation Priority

1. **HIGH**: ResourcesSchema definition (eliminates most type casting)
2. **HIGH**: Task type consistency (fixes child task issues)
3. **MEDIUM**: Group type alignment (simplifies group handling)
4. **MEDIUM**: Nullable field consistency (reduces fallback logic)
5. **LOW**: Error response schemas (improves error handling)

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