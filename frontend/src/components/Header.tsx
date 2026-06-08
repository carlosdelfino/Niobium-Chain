import { WalletConnect } from './WalletConnect'
import { Package } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Package className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">NiobiumChain</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
              Supply Chain
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
              Baterias
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">
              Veículos
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  )
}
