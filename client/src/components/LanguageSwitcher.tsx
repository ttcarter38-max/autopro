import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES } from '@/i18n';

interface Props {
  variant?: 'header' | 'default';
}

export default function LanguageSwitcher({ variant = 'default' }: Props) {
  const { i18n } = useTranslation();
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language.split('-')[0]) ?? SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === 'header' ? 'ghost' : 'outline'}
          size="sm"
          className={variant === 'header' ? 'gap-1.5 text-white hover:bg-white/10' : 'gap-1.5'}
          data-testid="button-language-switcher"
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-semibold">{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            data-testid={`button-lang-${lang.code}`}
            className="flex items-center justify-between"
          >
            <span>{lang.label}</span>
            {current.code === lang.code && <Check className="w-4 h-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
