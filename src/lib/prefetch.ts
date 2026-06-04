export const prefetchRoute = (path: string) => {
  switch (path) {
    case '/pawn': import('../pages/PawnPage'); break;
    case '/cannabis': import('../pages/CannabisPage'); break;
    case '/fireworks': import('../pages/FireworksPage'); break;
    case '/tobacco': import('../pages/TobaccoPage'); break;
    case '/admin/dashboard': import('../pages/admin/DashboardPage'); break;
  }
}
