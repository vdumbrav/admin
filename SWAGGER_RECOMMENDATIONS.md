# Swagger API Schema Recommendations

**Date**: September 2025

## 🎯 **Что нужно обновить в API (3 пункта)**

### ⚠️ **1. ResourcesDto** - убрать `Record<string, unknown>`

### ⚠️ **2. IteratorDto** - убрать `{ [key: string]: unknown }`

### ⚠️ **3. Computed fields** - добавить usersCount/totalXp в GET /api/admin/tasks

## 🔧 **1. ResourcesDto Schema**

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

## 🔧 **2. IteratorDto Schema**

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

## 🔧 **3. Computed Fields**

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
