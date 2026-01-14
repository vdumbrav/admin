/** UI rules: button text, popup content, resource structure. */
import type { PresetConfig } from '../presets/types';
import type { QuestFormValues } from '../types/form-types';
import { getPopupNameForGroup, ResourcePresets, toApiResources } from '../types/resources-types';

export function applyUIRules(
  values: QuestFormValues,
  presetConfig?: PresetConfig,
): QuestFormValues {
  const updatedValues = { ...values };

  if (presetConfig) {
    switch (presetConfig.id) {
      case 'action-with-post':
        applyActionWithPostUIRules(updatedValues);
        break;
      case 'connect':
        applyConnectUIRules(updatedValues);
        break;
      case 'join':
        applyJoinUIRules(updatedValues);
        break;
      case 'explore':
        applyExploreUIRules(updatedValues);
        break;
      case 'seven-day-challenge':
        applySevenDayChallengeUIRules(updatedValues);
        break;
    }
  }

  applyGenericUIRules(updatedValues);

  return updatedValues;
}

function applyActionWithPostUIRules(values: QuestFormValues): void {
  const existingIsNew = values.resources?.isNew;

  if (!values.resources) {
    values.resources = toApiResources(
      ResourcePresets.actionWithPost({
        username: '',
        group: values.group,
      }),
    );
    if (existingIsNew !== undefined) {
      values.resources.isNew = existingIsNew;
    }
    return;
  }

  if (values.child && values.child.length > 0) {
    const buttonText = generateTaskButtonText(values.child);
    if (buttonText && values.resources.ui) {
      values.resources.ui.button = buttonText;
      if (values.resources.ui['pop-up']) {
        values.resources.ui['pop-up'].button = buttonText;
      }
    }
  }

  if (values.group === 'partner' && values.resources.ui?.['pop-up']) {
    values.resources.ui['pop-up'].description = "Engage with our partner's Tweet to earn XP";
    values.resources.ui['pop-up'].name = 'Partner Quests';
  }
}

function applyConnectUIRules(values: QuestFormValues): void {
  if (!values.provider) return;

  const existingIsNew = values.resources?.isNew;
  values.resources = toApiResources(ResourcePresets.connect(values.provider, values.group));
  if (existingIsNew !== undefined) {
    values.resources.isNew = existingIsNew;
  }

  const descriptionMapping: Record<string, string> = {
    telegram: 'Connect your Telegram account to earn XP',
    discord: 'Connect your Discord account to earn XP',
    twitter: 'Connect your X account to earn XP',
  };

  const description = descriptionMapping[values.provider];
  if (description && values.resources.ui?.['pop-up']) {
    values.resources.ui['pop-up'].description = description;
  }

  if (values.provider === 'matrix') {
    if (values.resources.ui) {
      values.resources.ui.button = 'Add';
      if (values.resources.ui['pop-up']) {
        values.resources.ui['pop-up'].button = 'Add';
      }
    }
  }
}

function applyJoinUIRules(values: QuestFormValues): void {
  if (!values.provider) return;

  const existingIsNew = values.resources?.isNew;

  if (!values.resources) {
    values.resources = toApiResources(ResourcePresets.join(values.provider, values.group));
    if (existingIsNew !== undefined) {
      values.resources.isNew = existingIsNew;
    }
    return;
  }

  if (!values.resources.ui) return;

  if (values.type === 'join') {
    if (values.provider === 'twitter') {
      values.resources.ui.button = 'Follow';
    } else {
      values.resources.ui.button = 'Join';
    }
  }

  if (!values.resources.ui['pop-up']) return;

  values.resources.ui['pop-up'].button = values.resources.ui.button;

  if (!values.resources.ui['pop-up']['additional-title']) {
    if (values.provider === 'twitter') {
      values.resources.ui['pop-up']['additional-title'] = 'Connect your X';
    } else {
      const providerName = values.provider.charAt(0).toUpperCase() + values.provider.slice(1);
      values.resources.ui['pop-up']['additional-title'] = `Connect your ${providerName}`;
    }
  }

  if (!values.resources.ui['pop-up']['additional-description']) {
    if (values.provider === 'twitter') {
      values.resources.ui['pop-up']['additional-description'] =
        'Before starting the quest, ensure you connected X account';
    } else {
      const providerName = values.provider.charAt(0).toUpperCase() + values.provider.slice(1);
      values.resources.ui['pop-up']['additional-description'] =
        `Before starting the quest, ensure you connected ${providerName} account`;
    }
  }
}

function applyExploreUIRules(values: QuestFormValues): void {
  const existingIsNew = values.resources?.isNew;
  const existingButtonText = values.resources?.ui?.button;
  const existingPopupButton = values.resources?.ui?.['pop-up']?.button;
  const existingPopupDescription = values.resources?.ui?.['pop-up']?.description;
  const existingPopupName = values.resources?.ui?.['pop-up']?.name;
  const existingIcon = values.resources?.icon;
  // Preserve isNew value before overwriting resources
  const existingIsNew = values.resources?.isNew;

  // Use strict builder only when required fields are filled (avoids errors during initial form setup)
  const hasRequiredFields = existingPopupDescription && (existingPopupButton ?? existingButtonText);

  if (hasRequiredFields) {
    values.resources = toApiResources(
      ResourcePresets.explore({
        buttonText: existingButtonText ?? 'Visit',
        popupButton: existingPopupButton,
        popupDescription: existingPopupDescription,
        icon: existingIcon,
      }),
    );
    if (existingIsNew !== undefined) {
      values.resources.isNew = existingIsNew;
    }
  } else {
    ensureResourcesStructure(values);

    if (values.resources?.ui) {
      values.resources.ui.button = existingButtonText ?? 'Visit';
      if (values.resources.ui['pop-up']) {
        values.resources.ui['pop-up'].name = existingPopupName ?? 'Explore Quests';
        values.resources.ui['pop-up'].description = existingPopupDescription ?? '';
        values.resources.ui['pop-up'].button = existingPopupButton ?? existingButtonText ?? 'Visit';
      }
    }

    if (existingIcon && values.resources) {
      values.resources.icon = existingIcon;
    }

    if (existingIsNew !== undefined && values.resources) {
      values.resources.isNew = existingIsNew;
    }
  }

  // Restore isNew value
  if (existingIsNew !== undefined && values.resources) {
    values.resources.isNew = existingIsNew;
  }
}

function applySevenDayChallengeUIRules(values: QuestFormValues): void {
  const existingIsNew = values.resources?.isNew;

  values.resources ??= {
    ui: {
      button: 'Boost XP',
      'pop-up': {
        name: 'Daily Quests',
        button: 'Boost XP',
        description: '',
      },
    },
  };

  if (existingIsNew !== undefined) {
    values.resources.isNew = existingIsNew;
  }
}

function applyGenericUIRules(values: QuestFormValues): void {
  // Auto-set popup name from group (e.g. "Social Quests", "Partner Quests")
  if (!values.resources?.ui?.['pop-up']?.name) {
    const popupName = getPopupNameForGroup(values.group);
    if (popupName) {
      ensureResourcesStructure(values);
      if (values.resources?.ui?.['pop-up']) {
        values.resources.ui['pop-up'].name = popupName;
      }
    }
  }

  // Add "Connect your X" prompt for social providers (Connect gate UI)
  if (values.provider && (values.type === 'join' || values.type === 'multiple')) {
    const additionalTitle = PROVIDER_ADDITIONAL_TITLES[values.provider];
    if (additionalTitle) {
      ensureResourcesStructure(values);
      if (values.resources?.ui?.['pop-up']) {
        values.resources.ui['pop-up']['additional-title'] = additionalTitle;
        values.resources.ui['pop-up']['additional-description'] = CONNECT_GATE_DESCRIPTION.replace(
          'X account',
          `${values.provider === 'twitter' ? 'X' : values.provider} account`,
        );
      }
    }
  }
}

export function getDefaultButtonText(type: string): string {
  return TASK_BUTTON_MAPPING[type] ?? 'Complete';
}

function generateTaskButtonText(children: QuestFormValues['child']): string | null {
  if (!children || children.length === 0) return null;

  if (children.length === 1) {
    const taskType = children[0].type;
    return TASK_BUTTON_MAPPING[taskType] ?? 'Engage';
  }

  return 'Engage';
}

function ensureResourcesStructure(values: QuestFormValues): void {
  values.resources ??= {
    ui: {
      button: 'Continue',
      'pop-up': {
        name: '',
        description: '',
        button: 'Continue',
      },
    },
  };

  values.resources.ui ??= {
    button: 'Continue',
    'pop-up': {
      name: '',
      description: '',
      button: 'Continue',
    },
  };

  values.resources.ui['pop-up'] ??= {
    name: '',
    description: '',
    button: values.resources.ui.button ?? 'Continue',
  };
}

export const TASK_BUTTON_MAPPING: Record<string, string> = {
  like: 'Like',
  comment: 'Comment',
  share: 'Retweet',
  connect: 'Follow & Engage',
  join: 'Join',
};

const PROVIDER_ADDITIONAL_TITLES: Record<string, string> = {
  twitter: 'Connect your X',
  discord: 'Connect your Discord',
  telegram: 'Connect your Telegram',
};

const CONNECT_GATE_DESCRIPTION = 'Before starting the quest, ensure you connected X account';
