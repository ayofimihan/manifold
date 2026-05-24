import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

export const chakraTheme = extendTheme({
  config,
  components: {
    Menu: {
      baseStyle: {
        list: {
          background: '#0F1214',
          border: '1px solid #1A1F23',
          borderRadius: 0,
          padding: 0,
          minWidth: '18rem',
          boxShadow: 'none',
          py: 0,
        },
        item: {
          background: 'transparent',
          padding: 0,
          _hover: { background: 'transparent' },
          _focus: { background: 'transparent' },
          _active: { background: 'transparent' },
        },
        groupTitle: { display: 'none' },
        divider: { borderColor: '#1A1F23', margin: 0 },
      },
    },
    Drawer: {
      baseStyle: {
        overlay: { background: 'rgba(0,0,0,0.4)' },
        dialog: {
          background: '#050607',
          borderRadius: 0,
          boxShadow: '-1px 0 0 0 #1A1F23, 0 20px 40px rgba(0,0,0,0.5)',
        },
        dialogContainer: { zIndex: 50 },
      },
    },
    Switch: {
      baseStyle: {
        track: {
          background: '#06080A',
          border: '1px solid #1A1F23',
          borderRadius: 0,
          padding: '1px',
          _checked: { background: 'rgba(45,212,191,0.15)', borderColor: 'rgba(45,212,191,0.5)' },
        },
        thumb: {
          background: '#5C6469',
          borderRadius: 0,
          _checked: { background: '#2DD4BF' },
        },
      },
      sizes: {
        md: {
          track: { width: '36px', height: '20px' },
          thumb: { width: '14px', height: '14px', _checked: { transform: 'translateX(16px)' } },
        },
      },
    },
  },
});
