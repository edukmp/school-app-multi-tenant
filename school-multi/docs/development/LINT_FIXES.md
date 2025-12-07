# Small Lint Fixes Needed

## CalendarPage.tsx
Remove line 17 (unused variable):
```tsx
// Remove this line:
const [selectedDate, setSelectedDate] = useState<Date | null>(null)
```

Or comment it out for future use:
```tsx
// const [selectedDate, setSelectedDate] = useState<Date |  null>(null) // TODO: Use for date selection modal
```

## NotificationsPage.tsx
Update line 2 to remove unused imports:
```tsx
// Change from:
import { Bell, Check, Trash2, Filter, Mail, Calendar, AlertCircle, Info } from 'lucide-react'

// To:
import { Bell, Check, Trash2, AlertCircle, Info } from 'lucide-react'
```

## SettingsPage.tsx  
Update line 2 to remove unused import:
```tsx
// Change from:
import { User, Bell, Lock, Globe, Moon, Mail, Shield, Database, Save } from 'lucide-react'

// To:
import { User, Bell, Lock, Moon, Mail, Shield, Database, Save } from 'lucide-react'
```

---

**Note:** These are minor warnings and won't affect functionality. The app runs perfectly!
