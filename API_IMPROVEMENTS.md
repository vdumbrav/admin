# API Improvements для Quest System

**Дата**: September 22, 2025
**Статус**: Актуальный план изменений

## 🎯 **Приоритеты изменений**

### **P0 - КРИТИЧНО (блокирует упрощение frontend)**

#### **1. IteratorDto.reward_map: string[] → number[]**
```yaml
# В swagger.yaml (или аналогичном файле)
TaskResponseDtoIterator:
  properties:
    reward_map:
      type: array
      items:
        type: number  # ❌ Сейчас: string, ✅ Нужно: number
        minimum: 0
      description: "Массив наград за каждый день"
      example: [10, 20, 30, 40, 50, 70, 100]
```

**Что исправить на Backend**:
- Изменить тип поля `reward_map` с `string[]` на `number[]` в Swagger схеме

**Что улучшится на Frontend**:
- ✅ Убрать `.map(String)` конверсию в адаптерах
- ✅ Упростить Zod schemas
- ✅ Убрать 3 TODO P0 из кода

**Файлы с TODO для проверки**:
- `src/features/quests/adapters/form-api-adapter.ts:148`
- `src/features/quests/data/schemas.ts:50`

---

### **P1 - ВАЖНО (качество архитектуры)**

#### **2. IteratorDto неиспользуемые поля**
```yaml
# Сделать optional или убрать из IteratorDto:
iterator_resource:
  type: object
  required: false  # или убрать совсем
resource:
  type: object
  required: false  # или убрать совсем
```

**Что исправить на Backend**:
- Сделать поля `iterator_resource` и `resource` optional в IteratorDto
- Или убрать их совсем если не планируется использование

**Что улучшится на Frontend**:
- ✅ Убрать отправку пустых объектов `{}`
- ✅ Упростить схемы
- ✅ Убрать временный код для API совместимости

**Файлы с TODO для проверки**:
- `src/features/quests/adapters/form-api-adapter.ts:153-154`

#### **3. TYPE_PROVIDER_REQUIREMENTS в API**
```yaml
# Новый endpoint для конфигурации
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

**Что добавить на Backend**:
- Создать новый endpoint `/api/admin/quest-type-provider-requirements`
- Вернуть объект с mapping типов задач к поддерживаемым провайдерам

**Что улучшится на Frontend**:
- ✅ Убрать hardcoded mapping из `data.ts`
- ✅ Конфигурируемые требования через admin panel
- ✅ Консистентность с остальной API

**Файлы с TODO для проверки**:
- `src/features/quests/data/data.ts:156-162`

---

### **P2 - NICE TO HAVE (улучшение DX)**

#### **4. Унификация Create/Update/Response DTOs**

**Проблема сейчас**:
```typescript
// Разные структуры типов
CreateTaskDto: { type: CreateTaskDtoType }      // single value
TaskResponseDto: { type: TaskResponseDtoTypeItem[] }  // array

// Разные енумы для одного и того же
CreateTaskDtoType.external vs TaskResponseDtoTypeItem.external
```

**Что унифицировать на Backend**:
```yaml
# Использовать общий enum и структуру для всех DTO:
TaskType:
  type: string
  enum: [join, multiple, referral, connect, share, like, comment, repeatable, dummy, external]

CreateTaskDto:
  type: { $ref: '#/components/schemas/TaskType' }
UpdateTaskDto:
  type: { $ref: '#/components/schemas/TaskType' }
TaskResponseDto:
  type: { $ref: '#/components/schemas/TaskType' }
```

**Что улучшится на Frontend**:
- ✅ Упростить `validateAndConvertToApi` функцию
- ✅ Убрать casting `as unknown as CreateTaskDto`
- ✅ Единые типы для всех операций

**Файлы с TODO для проверки**:
- `src/features/quests/api.ts:155,179`
- `src/features/quests/adapters/form-api-adapter.ts:255`

---

## 📋 **Чеклист для Backend**

### **Перед началом**:
- [ ] Проверить что Frontend готов к изменениям (есть временные адаптеры)
- [ ] Учесть breaking changes для других частей системы
- [ ] Подготовить миграцию если необходимо

### **P0 - Критично**:
- [ ] **IteratorDto.reward_map**: изменить тип с `string[]` на `number[]`
  - Файл: Swagger схема
  - Поле: `TaskResponseDtoIterator.reward_map.items.type`
  - Изменение: `string` → `number`

### **P1 - Важно**:
- [ ] **IteratorDto поля**: сделать `iterator_resource` и `resource` optional или убрать
- [ ] **Quest Type Provider Requirements**: создать endpoint `GET /api/admin/quest-type-provider-requirements`
- [ ] Обновить API документацию

### **P2 - Nice to have**:
- [ ] Унифицировать `CreateTaskDto`, `UpdateTaskDto`, `TaskResponseDto` типы
- [ ] Создать общие енумы для типов задач
- [ ] Использовать единую структуру данных

---

## 🔄 **После каждого изменения**

### **Frontend cleanup**:
1. Запустить `npm run generate:api` для обновления типов
2. Найти и удалить соответствующие TODO из кода
3. Упростить адаптеры где это стало возможно
4. Проверить `npm run typecheck` и `npm run build`

### **Обязательное тестирование**:
- [ ] Quest creation/editing работает
- [ ] 7-day challenge корректно создается и отображается
- [ ] Iterator rewards правильно сохраняются и отображаются
- [ ] Type provider requirements работают в форме

---

## 📊 **Ожидаемые улучшения**

**После P0 (IteratorDto.reward_map)**:
- 📉 -10 строк кода в адаптерах
- 🛡️ +100% type safety для iterator
- ✅ Убрать 3 TODO P0 из кода

**После P1**:
- 📉 -20 строк кода в адаптерах
- ⚡ +динамическая конфигурация через API
- 🏗️ +architectural quality

**После P2**:
- 📉 -50 строк кода в адаптерах
- 🔄 +unified API types
- 👨‍💻 +значительно лучший Developer Experience

**Итого**: ~80 строк кода меньше, значительно лучше type safety и DX!

---

## 🎯 **Текущий статус Frontend**

### ✅ **Готово к изменениям**:
- [x] ResourcesDto используется напрямую из API
- [x] ChildFormValues использует Pick<TaskResponseDto>
- [x] Form schema совместима с API типами
- [x] Временные адаптеры для обратной совместимости
- [x] TODO маркеры для отслеживания изменений

### 🔄 **Адаптеры убрать после Backend fixes**:
- Iterator string[]→number[] конверсия (после P0)
- Пустые объекты iterator_resource/resource (после P1)
- Hardcoded TYPE_PROVIDER_REQUIREMENTS (после P1)
- validateAndConvertToApi упрощение (после P2)

Frontend код уже оптимизирован и готов к Backend изменениям!