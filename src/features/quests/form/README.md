# Quest Form Module

**Status: ⚠️ 80% Complete - Migration to Direct API Integration**

Модульная архитектура для управления формой создания/редактирования квестов с частичной миграцией на прямую интеграцию с API.

## 📊 Current Migration Status (80% Complete)

### ✅ **Completed (80%)**

- ✅ Real API integration for all CRUD operations
- ✅ Type-safe form handling with Quest types
- ✅ Basic adapter layer for form-API compatibility
- ✅ All 5 quest presets functional with real API
- ✅ Production-ready error handling

### ⚠️ **Remaining Issues (20%)**

- ⚠️ **8 TODO items** requiring API schema improvements
- ⚠️ **Type safety compromises** with `Record<string, unknown>` casting
- ⚠️ **Legacy partnerIcon field** still present
- ⚠️ **Hardcoded fallback values** for child tasks
- ⚠️ **Missing Zod validation** in adapter layer

## 🏗️ Architecture Status

```
form/
├── field-state.ts          # ✅ Complete - управление состоянием полей
├── business-rules.ts       # ✅ Complete - бизнес-логика и расчеты
├── use-quest-form.ts       # ✅ Complete - хук для управления состоянием
├── quest-form-fields.tsx   # ⚠️ Legacy field - компонент полей формы (partnerIcon)
├── quest-form-container.tsx # ✅ Complete - основной контейнер
├── use-connect-gate.ts     # ⚠️ Type safety - проверка connect требований
├── index.ts               # ✅ Complete - экспорты модуля
└── README.md              # 📝 This documentation
```

## 📦 Модули

### `field-state.ts`

Управление видимостью и состоянием полей на основе конфигурации пресетов.

```typescript
import { computeFieldStates, isFieldVisible } from './field-state';

const fieldStates = computeFieldStates(presetConfig, formValues);
const showField = isFieldVisible('provider', fieldStates);
```

**Функции:**

- `computeFieldStates()` - Вычисляет матрицу состояний полей
- `getFieldState()` - Получает состояние конкретного поля
- `isFieldVisible()` - Проверяет видимость поля
- `isFieldDisabled()` - Проверяет блокировку поля
- `isFieldReadonly()` - Проверяет readonly режим

### `business-rules.ts`

Бизнес-логика, расчеты и автоматическое заполнение полей.

```typescript
import { applyBusinessRules, calculateTotalReward } from './business-rules';

const updatedValues = applyBusinessRules(formValues, presetConfig);
const total = calculateTotalReward(childTasks);
```

**Функции:**

- `getPresetFormValues()` - Создает дефолтные значения с учетом пресета
- `applyBusinessRules()` - Применяет бизнес-правила
- `calculateTotalReward()` - Рассчитывает общую награду
- `getConnectGateWarnings()` - Проверяет connect-gate требования

### `use-quest-form.ts`

Центральный хук для управления состоянием формы.

```typescript
import { useQuestForm } from './use-quest-form';

const { form, fieldStates, handleSubmit, connectGateWarnings } = useQuestForm({
  presetConfig,
  onSubmit,
  onCancel,
});
```

**Возвращает:**

- `form` - React Hook Form instance
- `fieldStates` - Матрица состояний полей
- `handleSubmit` - Обработчик отправки
- `handleImageUpload` - Загрузка изображений
- `connectGateWarnings` - Предупреждения connect-gate

### `quest-form-fields.tsx`

Компонент для рендеринга полей формы на основе состояния.

```typescript
import { QuestFormFields } from './quest-form-fields';

<QuestFormFields
  form={form}
  fieldStates={fieldStates}
  presetConfig={presetConfig}
  onImageUpload={handleImageUpload}
  connectGateWarnings={connectGateWarnings}
/>
```

### `quest-form-container.tsx`

Основной контейнер, объединяющий все компоненты.

```typescript
import { QuestForm } from './form';

<QuestForm
  presetConfig={presetConfig}
  initial={initialValues}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## 🔄 Использование

### Базовое использование

```typescript
import { QuestForm } from '@/features/quests/form';

<QuestForm
  initial={formData}
  presetConfig={preset}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### Прямое использование модулей

```typescript
import { useQuestForm, QuestFormFields } from '@/features/quests/form';

function CustomQuestForm() {
  const formState = useQuestForm({ /* props */ });

  return (
    <Form {...formState.form}>
      <QuestFormFields {...formState} />
      {/* Кастомные элементы */}
    </Form>
  );
}
```

## ✨ Ключевые особенности

### Модульность

- Каждый модуль имеет четкую ответственность
- Легко тестировать отдельные части
- Возможность переиспользования логики

### Type Safety

- Полная типизация всех модулей без assertions
- Современные паттерны React Hook Form v7
- Автокомплит и проверка типов
- Безопасный рефакторинг

### Performance

- Мемоизация вычислений состояний
- Оптимизированные ре-рендеры
- Эффективное управление формой
- Zero type assertions для лучшей производительности

### Extensibility

- Легко добавлять новые пресеты
- Простое расширение бизнес-правил
- Гибкое управление состоянием полей

## 🧪 Верификация

Проверяйте изменения вручную через UI:

- Создание квеста из каждого пресета (валидные/невалидные данные)
- Состояния полей: visible/hidden/readonly
- Бизнес-правила: авторасчёты, connect-gate предупреждения
- Сохранение/редактирование и возврат к списку

## 🔮 Дальнейшее развитие

### Планируемые улучшения

- [ ] Добавление unit тестов для всех модулей
- [ ] Создание Storybook stories для компонентов
- [ ] Интеграция с React DevTools
- [ ] Добавление error boundaries
- [ ] Оптимизация производительности с React.memo

### Возможные расширения

- [ ] Pluggable validation system
- [ ] Dynamic form field registration
- [ ] Advanced field dependencies
- [ ] Custom preset builder UI
- [ ] Form analytics and tracking

---

**🎯 Результат:** Модульная архитектура обеспечивает читаемость, тестируемость и расширяемость кода.
