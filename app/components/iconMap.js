import {
  Baby, Balcony, Bed, Bell, Building, Bus, Calendar, Camera, Car, Cash, CheckCircle,
  Clock, CreditCard, Dumbbell, Globe, Heart, MapPin, Parking, Ship, User, Users,
  Utensils, Wallet, Waves, Wifi, XCircle,
  Mail, Phone, Tag, Ticket,
} from './Icons';

export const icons = {
  baby: Baby,
  balcony: Balcony,
  bed: Bed,
  bell: Bell,
  building: Building,
  bus: Bus,
  calendar: Calendar,
  camera: Camera,
  car: Car,
  cash: Cash,
  check: CheckCircle,
  clock: Clock,
  card: CreditCard,
  dumbbell: Dumbbell,
  globe: Globe,
  heart: Heart,
  parking: Parking,
  pin: MapPin,
  ship: Ship,
  user: User,
  users: Users,
  utensils: Utensils,
  wallet: Wallet,
  waves: Waves,
  wifi: Wifi,
  mail: Mail,
  phone: Phone,
  tag: Tag,
  ticket: Ticket,
  xcircle: XCircle,
};

export function Icon({ name, ...rest }) {
  const Cmp = icons[name] ?? MapPin;
  return <Cmp {...rest} />;
}
