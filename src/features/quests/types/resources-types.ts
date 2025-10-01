/**
 * Strict typing for resources and UI configuration
 * Extends the generated ResourcesDto with better type safety
 */
import type { AdsgramDto, ResourcesDto } from '@/lib/api/generated/model';

/**
 * UI popup configuration with strict typing
 */
export interface UIPopupConfig {
  name: string;
  description: string;
  button: string;
  'additional-title'?: string;
  'additional-description'?: string;
  static?: string;
}

/**
 * UI configuration with strict typing
 */
export interface UIConfig {
  button: string;
  'pop-up'?: UIPopupConfig;
}

/**
 * Adsgram configuration - extending the generated AdsgramDto
 */
export interface AdsgramConfig extends Omit<AdsgramDto, 'type' | 'subtype'> {
  blockId: string;
  type?: string;
  subtype?: string;
  // Additional adsgram properties can be added here when requirements are known
}

/**
 * Strictly typed resources interface
 * Extends ResourcesDto with better type safety while maintaining compatibility
 */
export interface StrictResourcesDto extends Omit<ResourcesDto, 'ui'> {
  // Override ui with stricter typing
  ui?: UIConfig;
}

/**
 * Type-safe builder for UI popup configuration
 */
export class UIPopupBuilder {
  private config: Partial<UIPopupConfig> = {};

  name(name: string): this {
    this.config.name = name;
    return this;
  }

  description(description: string): this {
    this.config.description = description;
    return this;
  }

  button(button: string): this {
    this.config.button = button;
    return this;
  }

  additionalTitle(title: string): this {
    this.config['additional-title'] = title;
    return this;
  }

  additionalDescription(description: string): this {
    this.config['additional-description'] = description;
    return this;
  }

  static(staticContent: string): this {
    this.config.static = staticContent;
    return this;
  }

  build(): UIPopupConfig {
    if (!this.config.name || !this.config.description || !this.config.button) {
      throw new Error('UIPopup requires name, description, and button');
    }
    return this.config as UIPopupConfig;
  }
}

/**
 * Type-safe builder for UI configuration
 */
export class UIConfigBuilder {
  private config: Partial<UIConfig> = {};

  button(button: string): this {
    this.config.button = button;
    return this;
  }

  popup(popup: UIPopupConfig | ((builder: UIPopupBuilder) => UIPopupBuilder)): this {
    if (typeof popup === 'function') {
      this.config['pop-up'] = popup(new UIPopupBuilder()).build();
    } else {
      this.config['pop-up'] = popup;
    }
    return this;
  }

  build(): UIConfig {
    if (!this.config.button) {
      throw new Error('UIConfig requires button');
    }
    return this.config as UIConfig;
  }
}

/**
 * Type-safe builder for resources
 */
export class ResourcesBuilder {
  private readonly resources: Partial<StrictResourcesDto> = {};

  icon(icon: string): this {
    this.resources.icon = icon;
    return this;
  }

  username(username: string): this {
    this.resources.username = username;
    return this;
  }

  tweetId(tweetId: string): this {
    this.resources.tweetId = tweetId;
    return this;
  }

  isNew(isNew: boolean): this {
    this.resources.isNew = isNew;
    return this;
  }

  blockId(blockId: string): this {
    this.resources.block_id = blockId;
    return this;
  }

  ui(ui: UIConfig | ((builder: UIConfigBuilder) => UIConfigBuilder)): this {
    if (typeof ui === 'function') {
      this.resources.ui = ui(new UIConfigBuilder()).build();
    } else {
      this.resources.ui = ui;
    }
    return this;
  }

  adsgram(config: AdsgramConfig): this {
    this.resources.adsgram = config;
    return this;
  }

  build(): StrictResourcesDto {
    return this.resources as StrictResourcesDto;
  }
}

/**
 * Validation functions for resources
 */
export function validateUIConfig(ui: unknown): ui is UIConfig {
  if (!ui || typeof ui !== 'object') return false;

  return 'button' in ui && typeof (ui as { button: unknown }).button === 'string';
}

export function validateUIPopupConfig(popup: unknown): popup is UIPopupConfig {
  if (!popup || typeof popup !== 'object') return false;

  const hasRequiredFields = 'name' in popup && 'description' in popup && 'button' in popup;

  if (!hasRequiredFields) return false;

  const typed = popup as { name: unknown; description: unknown; button: unknown };
  return (
    typeof typed.name === 'string' &&
    typeof typed.description === 'string' &&
    typeof typed.button === 'string'
  );
}

export function validateResourcesDto(resources: unknown): resources is StrictResourcesDto {
  if (!resources || typeof resources !== 'object') return false;

  // Type-safe property checking without casting
  const checkOptionalStringField = (obj: object, field: string): boolean => {
    if (!(field in obj)) return true;
    const value = (obj as Record<string, unknown>)[field];
    return value === undefined || typeof value === 'string';
  };

  const checkOptionalBooleanField = (obj: object, field: string): boolean => {
    if (!(field in obj)) return true;
    const value = (obj as Record<string, unknown>)[field];
    return value === undefined || typeof value === 'boolean';
  };

  // Optional fields validation
  if (!checkOptionalStringField(resources, 'icon')) return false;
  if (!checkOptionalStringField(resources, 'username')) return false;
  if (!checkOptionalStringField(resources, 'tweetId')) return false;
  if (!checkOptionalBooleanField(resources, 'isNew')) return false;
  if (!checkOptionalStringField(resources, 'block_id')) return false;

  // UI config validation
  if ('ui' in resources && resources.ui !== undefined && !validateUIConfig(resources.ui))
    return false;

  return true;
}

/**
 * Safe converter from ResourcesDto to StrictResourcesDto
 */
export function toStrictResources(resources: unknown): StrictResourcesDto | null {
  if (!validateResourcesDto(resources)) return null;
  return resources;
}

/**
 * Convert StrictResourcesDto to ResourcesDto for API compatibility
 */
export function toApiResources(resources: StrictResourcesDto): ResourcesDto {
  // StrictResourcesDto is compatible with ResourcesDto (our types are stricter)
  return resources as ResourcesDto;
}

/**
 * Convert ResourcesDto from API to StrictResourcesDto for internal use
 */
export function fromApiResources(resources: ResourcesDto): StrictResourcesDto {
  // Build strict resources with proper type conversion
  const strictResources: StrictResourcesDto = {
    icon: resources.icon,
    username: resources.username,
    tweetId: resources.tweetId,
    isNew: resources.isNew,
    block_id: resources.block_id,
    adsgram: resources.adsgram,
  };

  // Convert UI config if present
  if (resources.ui) {
    const uiConfig: UIConfig = {
      button: resources.ui.button ?? 'Continue', // Ensure required button field
    };

    // Convert popup config if present
    if (resources.ui['pop-up']) {
      const apiPopup = resources.ui['pop-up'];
      uiConfig['pop-up'] = {
        name: apiPopup.name ?? '',
        description: apiPopup.description ?? '',
        button: apiPopup.button ?? uiConfig.button,
        'additional-title': apiPopup['additional-title'],
        'additional-description': apiPopup['additional-description'],
        static: apiPopup.static,
      };
    }

    strictResources.ui = uiConfig;
  }

  return strictResources;
}

/**
 * Preset-specific resource builders
 */
export const ResourcePresets = {
  /**
   * Build resources for action-with-post preset
   */
  actionWithPost: (options: {
    username?: string;
    buttonText?: string;
    popupName?: string;
    isPartner?: boolean;
  }): StrictResourcesDto => {
    return new ResourcesBuilder()
      .username(options.username ?? '')
      .ui((ui) =>
        ui.button(options.buttonText ?? 'Engage').popup((popup) =>
          popup
            .name(options.popupName ?? (options.isPartner ? 'Partner Quests' : 'Social Quests'))
            .description(
              options.isPartner
                ? "Engage with our partner's Tweet to earn XP"
                : 'Engage with our Tweet to earn XP',
            )
            .button(options.buttonText ?? 'Engage')
            .additionalTitle('Connect your X')
            .additionalDescription('Before starting the quest, ensure you connected X account'),
        ),
      )
      .build();
  },

  /**
   * Build resources for connect preset
   */
  connect: (provider: string): StrictResourcesDto => {
    const providerName = provider === 'twitter' ? 'X' : provider;
    return new ResourcesBuilder()
      .ui((ui) =>
        ui.button(provider === 'matrix' ? 'Add' : 'Connect').popup((popup) =>
          popup
            .name('Social Quests')
            .description(`Connect your ${providerName} account`)
            .button(provider === 'matrix' ? 'Add' : 'Connect'),
        ),
      )
      .build();
  },

  /**
   * Build resources for join preset
   */
  join: (provider: string): StrictResourcesDto => {
    const buttonText = provider === 'twitter' ? 'Follow' : 'Join';
    return new ResourcesBuilder()
      .ui((ui) =>
        ui.button(buttonText).popup((popup) =>
          popup
            .name('Social Quests')
            .description(`${buttonText} to earn XP`)
            .button(buttonText)
            .additionalTitle(`Connect your ${provider === 'twitter' ? 'X' : provider}`)
            .additionalDescription(
              `Before starting the quest, ensure you connected ${
                provider === 'twitter' ? 'X' : provider
              } account`,
            ),
        ),
      )
      .build();
  },

  /**
   * Build resources for explore preset
   */
  explore: (options: {
    buttonText?: string;
    popupDescription?: string;
    icon?: string;
  }): StrictResourcesDto => {
    return new ResourcesBuilder()
      .icon(options.icon ?? '')
      .ui((ui) =>
        ui.button(options.buttonText ?? 'Boost XP').popup((popup) =>
          popup
            .name('Explore Quests')
            .description(options.popupDescription ?? 'Visit the link to complete this quest')
            .button(options.buttonText ?? 'Boost XP'),
        ),
      )
      .build();
  },
};
