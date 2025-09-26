# Система пресетов квестов

**Дата**: 26 сентября 2025
**Статус**: Полная документация системы

## 📋 **Обзор системы**

Система пресетов квестов предоставляет конфигурируемые шаблоны для создания различных типов квестов с автоматическим заполнением полей и применением бизнес-логики.

## 🎯 **Типы пресетов**

### **Connect** 🔗
- **Назначение**: Подключение аккаунтов социальных сетей
- **Тип квеста**: `connect`
- **Провайдеры**: Twitter, Discord, Telegram, Matrix
- **Особенности**: Автосмена кнопки "Add" для Matrix

### **Join** 👥
- **Назначение**: Присоединение к каналам и группам
- **Тип квеста**: `join`
- **Провайдеры**: Twitter, Discord, Telegram
- **Зависимости**: Требует Connect квест для того же провайдера
- **Особенности**: Кнопка "Follow" для Twitter

### **Action with Post** 💬
- **Назначение**: Взаимодействие с постами в Twitter
- **Тип квеста**: `multiple` (лайк, комментарий, ретвит)
- **Провайдер**: Twitter (фиксированный)
- **Зависимости**: Требует Connect Twitter квест
- **Поля**: Username, Tweet ID, список задач

### **7-day Challenge** 📅
- **Назначение**: Ежедневные награды за 7 дней
- **Тип квеста**: `repeatable`
- **Провайдер**: Internal (walme)
- **Особенности**: Настройка наград по дням, итератор

### **Explore** 🔍
- **Назначение**: Переход на внешние ресурсы
- **Тип квеста**: `external`
- **Провайдеры**: Любой
- **Особенности**: Conditional Connect gate для социальных доменов

## 🏗️ **Архитектура**

### **Компоненты системы:**
- **PresetManager** - управление конфигурациями
- **FieldStateMatrix** - видимость полей формы
- **BusinessRules** - автоматические вычисления
- **ConnectGate** - проверка зависимостей

### **API интеграция:**
```typescript
interface TaskResponseDto {
  preset?: string;              // ID пресета
  blocking_task?: {id: number}; // Блокирующий квест
  iterator?: IteratorDto;       // Для повторяемых квестов
  resource?: ResourcesDto;      // UI ресурсы
}
```

### **Типы полей форм:**
```typescript
interface QuestFormValues {
  title: string;
  type: QuestType;
  group: QuestGroup;
  provider?: Provider;
  blocking_task?: {id: number};
  resources?: ResourcesDto;
  child?: ChildFormValues[];     // Для multiple квестов
  iterator?: {                   // Для repeatable квестов
    days: number;
    reward_map: number[];
  };
}
```

## 🔧 **Бизнес-логика**

### **Автоматизация полей:**
- **Pop-up название** - по группе квеста
- **Кнопки действий** - по провайдеру и типу
- **Connect gate поля** - дополнительные инструкции
- **Общая награда** - сумма из задач/итератора

### **Валидация зависимостей:**
- Join/Action квесты проверяют наличие Connect
- Conditional Connect gate для Explore с социальными доменами
- Проверка обязательных полей по пресету

## 🎨 **UI компоненты**

### **Специальные редакторы:**
- **TasksEditor** - редактор задач для Action with Post
- **DailyRewardsEditor** - настройка наград по дням
- **TwitterPreview** - превью твитов с таймаутом
- **BlockingTaskSelector** - выбор родительского квеста

### **Управление видимостью:**
```typescript
type FieldVisibility = 'visible' | 'hidden' | 'readonly' | 'conditional';
```

## 📂 **Структура файлов**

```
src/features/quests/
├── presets/
│   ├── types.ts              # Типы конфигураций
│   ├── preset-manager.ts     # Менеджер пресетов
│   └── configs/              # Конфигурации пресетов
│       ├── connect.ts
│       ├── join.ts
│       ├── action-with-post.ts
│       ├── seven-day-challenge.ts
│       └── explore.ts
├── form/
│   ├── business-rules.ts     # Бизнес-логика
│   ├── field-state.ts        # Состояния полей
│   └── use-quest-form.ts     # Хук формы
├── types/
│   └── form-types.ts         # Типы форм
└── adapters/
    └── form-api-adapter.ts   # Адаптер форма-API
```
