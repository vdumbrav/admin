# Система пресетов квестов

**Дата**: 22 сентября 2025
**Статус**: ✅ Реализовано - требует UI интеграция для block_id

## 🎯 **Текущий статус**

### **✅ Реализовано**

- **Preset ID автозаполнение**: Автоматическое заполнение из валидных ключей ('connect', 'join', 'action-with-post', 'seven-day-challenge', 'explore')
- **Block ID инфраструктура**: Готова к интеграции - остается подключить функцию поиска connect quest в UI
- **Система пресетов**: Полная поддержка всех типов квестов с автозаполнением resources
- **API Integration**: Все поля корректно маппятся в API (preset ↔ TaskResponseDto.preset, block_id ↔ blocking_task)

### **⏳ Требует доработки**

- **Block ID UI интеграция**: Подключить callback функцию поиска в форме
- **Тестирование**: Функциональное тестирование preset/block_id в реальных сценариях

## 📋 **Что нужно сделать**

### **Block ID автоматизация**

**Текущее состояние**: Инфраструктура готова, логика реализована
**Нужно**: Подключить UI компонент

```typescript
// В форме нужно передать функцию поиска:
const findConnectQuestByProvider = (provider: string) => {
  // Найти quest с { provider: provider, type: "connect" }
  // Вернуть quest.id или null
};

// Использовать в applyBusinessRules:
applyBusinessRules(values, presetConfig, findConnectQuestByProvider);
```

**Логика**: Автоматически устанавливать block_id на ID родительского connect quest для того же provider

### **Тестирование**

**Что протестировать**:
- [ ] Preset ID корректно сохраняется в API
- [ ] Block ID автовыбор работает при наличии connect quest
- [ ] Форма корректно маппит новые поля в API запросы
- [ ] Валидация не блокирует сохранение из-за новых полей

## 🎯 **Технические детали для block_id**

### **API маппинг**

```typescript
// Form → API
{
  block_id: 123        // Form field
}
→
{
  blocking_task: { id: 123 }   // API field
}

// API → Form
{
  blocking_task: { id: 123 }   // API response
}
→
{
  block_id: 123        // Form field
}
```

### **Бизнес-логика**

```typescript
// В applyBusinessRules() уже реализовано:
if (
  updatedValues.provider &&           // Есть провайдер
  updatedValues.type !== 'connect' && // НЕ connect quest
  !updatedValues.block_id &&          // block_id еще не установлен
  _findConnectQuestByProvider         // Функция поиска передана
) {
  const connectQuestId = _findConnectQuestByProvider(updatedValues.provider);
  if (connectQuestId) {
    updatedValues.block_id = connectQuestId;
  }
}
```

### **Что готово**

- ✅ Поля добавлены в `form-types.ts` и `form-schema.ts`
- ✅ API маппинг в `form-api-adapter.ts`
- ✅ Бизнес-логика в `business-rules.ts`
- ✅ TypeScript типизация без ошибок
