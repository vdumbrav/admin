# Quests Features

## Multi-quest Editing

Selecting **Type = multiple** in the quest form reveals a child task editor. Admins can add, remove, and drag child tasks within the form. The editor keeps `order_by` in sync with the visual order, ensuring the backend receives the correct sequence.

## Reorder Mode

The quests table includes a Reorder toggle for admins. When enabled, pagination is replaced with a single list where rows can be dragged to new positions. Dropping a row immediately patches `/admin/quests/reorder` with the new `order_by` values.
