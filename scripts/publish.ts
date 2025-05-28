import { publish } from './release-scripts'
import { getPkgDir } from './releaseUtils'

publish({ getPkgDir, packageManager: 'pnpm' })
