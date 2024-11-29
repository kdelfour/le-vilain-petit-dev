/**
 * Interface représentant un élément de navigation dans le menu principal
 * @interface NavigationItem
 */
export interface NavigationItem {
  /** URL de destination du lien */
  href: string;
  /** Nom de l'icône Material Design Icons (optionnel) */
  icon?: string;
  /** Texte à afficher pour le lien */
  label: string;
  /** Indique si le label doit être affiché sur mobile (par défaut: true) */
  showLabelOnMobile?: boolean;
} 