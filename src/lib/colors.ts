import colors from '../../color.json';

export const colorScheme = colors.lightTheme;

// Helper function to get color values
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: unknown = colorScheme;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }
  
  return typeof value === 'string' ? value : '';
};

// Common color getters
export const getPrimaryColor = (shade: string = '600') => getColor(`primary.${shade}`);
export const getSecondaryColor = (shade: string = '600') => getColor(`secondary.${shade}`);
export const getSuccessColor = (shade: string = '500') => getColor(`success.${shade}`);
export const getWarningColor = (shade: string = '500') => getColor(`warning.${shade}`);
export const getErrorColor = (shade: string = '500') => getColor(`error.${shade}`);
export const getBackgroundColor = (type: string = 'primary') => getColor(`background.${type}`);
export const getTextColor = (type: string = 'primary') => getColor(`text.${type}`);
export const getBorderColor = (type: string = 'default') => getColor(`border.${type}`);

// Component-specific colors
export const getButtonColors = (variant: 'primary' | 'secondary' | 'success' | 'danger') => {
  return {
    background: getColor(`components.button.${variant}.background`),
    backgroundHover: getColor(`components.button.${variant}.backgroundHover`),
    text: getColor(`components.button.${variant}.text`),
    border: getColor(`components.button.${variant}.border`)
  };
};

export const getInputColors = () => ({
  background: getColor('components.input.background'),
  backgroundFocus: getColor('components.input.backgroundFocus'),
  border: getColor('components.input.border'),
  borderFocus: getColor('components.input.borderFocus'),
  text: getColor('components.input.text'),
  placeholder: getColor('components.input.placeholder')
});

export const getCardColors = () => ({
  background: getColor('components.card.background'),
  border: getColor('components.card.border'),
  shadow: getColor('components.card.shadow')
});

export const getSidebarColors = () => ({
  background: getColor('components.sidebar.background'),
  itemHover: getColor('components.sidebar.itemHover'),
  itemActive: getColor('components.sidebar.itemActive'),
  text: getColor('components.sidebar.text'),
  textActive: getColor('components.sidebar.textActive')
});

export const getStatusColors = (status: 'pending' | 'inProgress' | 'completed' | 'cancelled') => ({
  background: getColor(`status.${status}.background`),
  text: getColor(`status.${status}.text`),
  border: getColor(`status.${status}.border`)
});

export const getPriorityColors = (priority: 'low' | 'medium' | 'high' | 'urgent') => ({
  background: getColor(`priority.${priority}.background`),
  text: getColor(`priority.${priority}.text`),
  border: getColor(`priority.${priority}.border`)
});

export const getShadow = (size: 'sm' | 'default' | 'md' | 'lg' | 'xl') => getColor(`shadows.${size}`); 