import { generateMissions } from './missionData';

const officeData = [
  {
    id: 'mineriaBuild',
    name: 'Minería',
    description: 'Este edificio se encarga de la extracción de minerales y recursos valiosos del subsuelo. Proporciona materias primas esenciales para la industria y la construcción.',
    missions: generateMissions('mineriaBuild'),
  },
  {
    id: 'construccionBuild',
    name: 'Construcción',
    description: 'El motor de la expansión de la ciudad. Este sector se dedica a la edificación de nuevas estructuras, desde viviendas hasta complejos industriales.',
    missions: generateMissions('construccionBuild'),
  },
  {
    id: 'hotelBuild',
    name: 'Hotelería',
    description: 'Ofrece alojamiento y servicios a visitantes y turistas. Impulsa la economía local y genera empleo en el sector servicios.',
    missions: generateMissions('hotelBuild'),
  },
  {
    id: 'gobiernoBuild',
    name: 'Gobierno',
    description: 'Centro administrativo de la ciudad. Aquí se toman las decisiones políticas y se gestionan los servicios públicos para los ciudadanos.',
    missions: generateMissions('gobiernoBuild'),
  },
  {
    id: 'exploracionBuild',
    name: 'Exploración',
    description: 'Dedicado a descubrir nuevos territorios y recursos. Amplía las fronteras de la ciudad y abre nuevas oportunidades de desarrollo.',
    missions: generateMissions('exploracionBuild'),
  },
  {
    id: 'miliciaBuild',
    name: 'Milicia',
    description: 'Protege la ciudad de amenazas externas e internas. Garantiza la seguridad y el orden para sus habitantes.',
    missions: generateMissions('miliciaBuild'),
  },
  {
    id: 'fabricaBuild',
    name: 'Fábrica',
    description: 'Núcleo de la producción industrial. Transforma materias primas en bienes manufacturados, impulsando la economía y el empleo.',
    missions: generateMissions('fabricaBuild'),
  },
];

export default officeData;
