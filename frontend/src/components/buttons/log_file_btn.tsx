import { FileOpen } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { toast } from 'react-hot-toast';

import { useTranslation } from '@/hooks';
import { openLogFile } from '@/tauri_cmd';

export const LogFileButton = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('open-log-tooltip')}>
      <Button
        sx={{
          marginTop: '9px',
          width: '100%',
          height: '60%',
        }}
        onClick={async () => openLogFile().catch((e) => toast.error(`${e}`))}
        startIcon={<FileOpen />}
        type="button"
        variant="outlined"
      >
        {t('open-log-btn')}
      </Button>
    </Tooltip>
  );
};
