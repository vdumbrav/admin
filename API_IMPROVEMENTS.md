# API Improvements для Quest System

**Дата**: September 22, 2025
**Статус**: ❌ Требует backend исправлений - P0 критично

## 🎯 **Что нужно исправить в API**

### **P0 - КРИТИЧНО**

#### **1. IteratorDto.reward_map: string[] → number[]**

**Текущее состояние**: `reward_map: string[]`
**Должно быть**: `reward_map: number[]`

```yaml
# В swagger.yaml исправить:
TaskResponseDtoIterator:
  properties:
    reward_map:
      type: array
      items:
        type: number  # ← Изменить с string на number
        minimum: 0
      description: "Массив наград за каждый день"
      example: [10, 20, 30, 40, 50, 70, 100]
```

**Что улучшится на Frontend**:
- Убрать `.map(String)` конверсию в адаптерах
- Упростить Zod schemas
- Убрать 2 TODO P0 из кода

---

### **P1 - ВАЖНО**

#### **2. IteratorDto неиспользуемые поля**

**Текущее состояние**: `iterator_resource` и `resource` required
**Должно быть**: optional или убрать совсем

```yaml
# Сделать optional:
iterator_resource:
  type: object
  required: false
resource:
  type: object
  required: false
```

**Что улучшится**: Убрать отправку пустых объектов `{}`

#### **3. TYPE_PROVIDER_REQUIREMENTS endpoint**

**Текущее состояние**: hardcoded в frontend
**Должно быть**: API endpoint

```yaml
# Создать новый endpoint:
GET /api/admin/quest-type-provider-requirements
Response:
  {
    "like": ["twitter", "telegram"],
    "share": ["twitter", "telegram"],
    "comment": ["twitter"],
    "join": ["telegram", "discord"],
    "connect": ["twitter", "telegram"]
  }
```

**Что улучшится**: Динамическая конфигурация вместо hardcode

---

### **P2 - NICE TO HAVE**

#### **4. Унификация Create/Update/Response DTOs**

**Текущее состояние**: Разные структуры
- `CreateTaskDto: { type: CreateTaskDtoType }` (single value)
- `TaskResponseDto: { type: TaskResponseDtoTypeItem[] }` (array)

**Должно быть**: Единая структура

```yaml
# Унифицировать в single value:
CreateTaskDto:
  type: CreateTaskDtoType
TaskResponseDto:
  type: CreateTaskDtoType  # ← Изменить с array на single
```

**Что улучшится**: Убрать кастинги и array wrapping

---

## 📋 **Чеклист для Backend**

### **P0 - Критично**

- [ ] ❌ `IteratorDto.reward_map`: изменить тип `string[]` → `number[]`

### **P1 - Важно**

- [ ] `IteratorDto` поля: сделать `iterator_resource` и `resource` optional
- [ ] Создать endpoint `GET /api/admin/quest-type-provider-requirements`

### **P2 - Nice to have**

- [ ] Унифицировать структуры Create/Update/Response DTOs