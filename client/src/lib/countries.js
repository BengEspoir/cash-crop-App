/**
 * Country data for phone validation and dropdowns
 * Cameroon is excluded from international buyer options
 */

export const countries = [
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', phoneFormat: /^\d{9}$/ },
  { code: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱', phoneFormat: /^\d{9}$/ },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', phoneFormat: /^\d{9}$/ },
  { code: 'AD', name: 'Andorra', dialCode: '+376', flag: '🇦🇩', phoneFormat: /^\d{6}$/ },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴', phoneFormat: /^\d{9}$/ },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', phoneFormat: /^\d{10,11}$/ },
  { code: 'AM', name: 'Armenia', dialCode: '+374', flag: '🇦🇲', phoneFormat: /^\d{8}$/ },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', phoneFormat: /^\d{9}$/ },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', phoneFormat: /^\d{10,11}$/ },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿', phoneFormat: /^\d{9}$/ },
  { code: 'BS', name: 'Bahamas', dialCode: '+1', flag: '🇧🇸', phoneFormat: /^\d{10}$/ },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', phoneFormat: /^\d{8}$/ },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', phoneFormat: /^\d{10}$/ },
  { code: 'BY', name: 'Belarus', dialCode: '+375', flag: '🇧🇾', phoneFormat: /^\d{9}$/ },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', phoneFormat: /^\d{9}$/ },
  { code: 'BZ', name: 'Belize', dialCode: '+501', flag: '🇧🇿', phoneFormat: /^\d{7}$/ },
  { code: 'BJ', name: 'Benin', dialCode: '+229', flag: '🇧🇯', phoneFormat: /^\d{8}$/ },
  { code: 'BT', name: 'Bhutan', dialCode: '+975', flag: '🇧🇹', phoneFormat: /^\d{8}$/ },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', phoneFormat: /^\d{8}$/ },
  { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387', flag: '🇧🇦', phoneFormat: /^\d{8}$/ },
  { code: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼', phoneFormat: /^\d{7}$/ },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', phoneFormat: /^\d{10,11}$/ },
  { code: 'BN', name: 'Brunei', dialCode: '+673', flag: '🇧🇳', phoneFormat: /^\d{7}$/ },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', phoneFormat: /^\d{9}$/ },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', phoneFormat: /^\d{8}$/ },
  { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮', phoneFormat: /^\d{8}$/ },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭', phoneFormat: /^\d{8,9}$/ },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲', phoneFormat: /^6\d{8}$/ },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', phoneFormat: /^\d{10}$/ },
  { code: 'CV', name: 'Cape Verde', dialCode: '+238', flag: '🇨🇻', phoneFormat: /^\d{7}$/ },
  { code: 'CF', name: 'Central African Republic', dialCode: '+236', flag: '🇨🇫', phoneFormat: /^\d{8}$/ },
  { code: 'TD', name: 'Chad', dialCode: '+235', flag: '🇹🇩', phoneFormat: /^\d{8}$/ },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', phoneFormat: /^\d{9}$/ },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', phoneFormat: /^\d{11}$/ },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', phoneFormat: /^\d{10}$/ },
  { code: 'KM', name: 'Comoros', dialCode: '+269', flag: '🇰🇲', phoneFormat: /^\d{7}$/ },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬', phoneFormat: /^\d{9}$/ },
  { code: 'CD', name: 'Congo (DRC)', dialCode: '+243', flag: '🇨🇩', phoneFormat: /^\d{9}$/ },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', phoneFormat: /^\d{8}$/ },
  { code: 'HR', name: 'Croatia', dialCode: '+385', flag: '🇭🇷', phoneFormat: /^\d{9}$/ },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺', phoneFormat: /^\d{8}$/ },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', flag: '🇨🇾', phoneFormat: /^\d{8}$/ },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', phoneFormat: /^\d{9}$/ },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', phoneFormat: /^\d{8}$/ },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯', phoneFormat: /^\d{8}$/ },
  { code: 'DO', name: 'Dominican Republic', dialCode: '+1', flag: '🇩🇴', phoneFormat: /^\d{10}$/ },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', phoneFormat: /^\d{9}$/ },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', phoneFormat: /^\d{10}$/ },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', phoneFormat: /^\d{8}$/ },
  { code: 'GQ', name: 'Equatorial Guinea', dialCode: '+240', flag: '🇬🇶', phoneFormat: /^\d{9}$/ },
  { code: 'ER', name: 'Eritrea', dialCode: '+291', flag: '🇪🇷', phoneFormat: /^\d{7}$/ },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪', phoneFormat: /^\d{7,8}$/ },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹', phoneFormat: /^\d{9}$/ },
  { code: 'FJ', name: 'Fiji', dialCode: '+679', flag: '🇫🇯', phoneFormat: /^\d{7}$/ },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', phoneFormat: /^\d{9}$/ },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', phoneFormat: /^\d{9}$/ },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', phoneFormat: /^\d{8}$/ },
  { code: 'GM', name: 'Gambia', dialCode: '+220', flag: '🇬🇲', phoneFormat: /^\d{7}$/ },
  { code: 'GE', name: 'Georgia', dialCode: '+995', flag: '🇬🇪', phoneFormat: /^\d{9}$/ },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', phoneFormat: /^\d{10,11}$/ },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', phoneFormat: /^\d{9}$/ },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', phoneFormat: /^\d{10}$/ },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', phoneFormat: /^\d{8}$/ },
  { code: 'GN', name: 'Guinea', dialCode: '+224', flag: '🇬🇳', phoneFormat: /^\d{9}$/ },
  { code: 'GW', name: 'Guinea-Bissau', dialCode: '+245', flag: '🇬🇼', phoneFormat: /^\d{7}$/ },
  { code: 'GY', name: 'Guyana', dialCode: '+592', flag: '🇬🇾', phoneFormat: /^\d{7}$/ },
  { code: 'HT', name: 'Haiti', dialCode: '+509', flag: '🇭🇹', phoneFormat: /^\d{8}$/ },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', phoneFormat: /^\d{8}$/ },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', phoneFormat: /^\d{8}$/ },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺', phoneFormat: /^\d{9}$/ },
  { code: 'IS', name: 'Iceland', dialCode: '+354', flag: '🇮🇸', phoneFormat: /^\d{7}$/ },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', phoneFormat: /^\d{10}$/ },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', phoneFormat: /^\d{10,11}$/ },
  { code: 'IR', name: 'Iran', dialCode: '+98', flag: '🇮🇷', phoneFormat: /^\d{10}$/ },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶', phoneFormat: /^\d{10}$/ },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', phoneFormat: /^\d{9}$/ },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', phoneFormat: /^\d{9}$/ },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', phoneFormat: /^\d{10}$/ },
  { code: 'CI', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮', phoneFormat: /^\d{8}$/ },
  { code: 'JM', name: 'Jamaica', dialCode: '+1', flag: '🇯🇲', phoneFormat: /^\d{10}$/ },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', phoneFormat: /^\d{10}$/ },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', phoneFormat: /^\d{9}$/ },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿', phoneFormat: /^\d{10}$/ },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', phoneFormat: /^\d{9}$/ },
  { code: 'KI', name: 'Kiribati', dialCode: '+686', flag: '🇰🇮', phoneFormat: /^\d{8}$/ },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', phoneFormat: /^\d{8}$/ },
  { code: 'KG', name: 'Kyrgyzstan', dialCode: '+996', flag: '🇰🇬', phoneFormat: /^\d{9}$/ },
  { code: 'LA', name: 'Laos', dialCode: '+856', flag: '🇱🇦', phoneFormat: /^\d{9,10}$/ },
  { code: 'LV', name: 'Latvia', dialCode: '+371', flag: '🇱🇻', phoneFormat: /^\d{8}$/ },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', phoneFormat: /^\d{7,8}$/ },
  { code: 'LS', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸', phoneFormat: /^\d{8}$/ },
  { code: 'LR', name: 'Liberia', dialCode: '+231', flag: '🇱🇷', phoneFormat: /^\d{7,8}$/ },
  { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾', phoneFormat: /^\d{9}$/ },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423', flag: '🇱🇮', phoneFormat: /^\d{7}$/ },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', flag: '🇱🇹', phoneFormat: /^\d{8}$/ },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺', phoneFormat: /^\d{9}$/ },
  { code: 'MO', name: 'Macau', dialCode: '+853', flag: '🇲🇴', phoneFormat: /^\d{8}$/ },
  { code: 'MG', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬', phoneFormat: /^\d{9}$/ },
  { code: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼', phoneFormat: /^\d{9}$/ },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', phoneFormat: /^\d{9,10}$/ },
  { code: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻', phoneFormat: /^\d{7}$/ },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', phoneFormat: /^\d{8}$/ },
  { code: 'MT', name: 'Malta', dialCode: '+356', flag: '🇲🇹', phoneFormat: /^\d{8}$/ },
  { code: 'MH', name: 'Marshall Islands', dialCode: '+692', flag: '🇲🇭', phoneFormat: /^\d{7}$/ },
  { code: 'MR', name: 'Mauritania', dialCode: '+222', flag: '🇲🇷', phoneFormat: /^\d{8}$/ },
  { code: 'MU', name: 'Mauritius', dialCode: '+230', flag: '🇲🇺', phoneFormat: /^\d{8}$/ },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', phoneFormat: /^\d{10}$/ },
  { code: 'FM', name: 'Micronesia', dialCode: '+691', flag: '🇫🇲', phoneFormat: /^\d{7}$/ },
  { code: 'MD', name: 'Moldova', dialCode: '+373', flag: '🇲🇩', phoneFormat: /^\d{8}$/ },
  { code: 'MC', name: 'Monaco', dialCode: '+377', flag: '🇲🇨', phoneFormat: /^\d{8,9}$/ },
  { code: 'MN', name: 'Mongolia', dialCode: '+976', flag: '🇲🇳', phoneFormat: /^\d{8}$/ },
  { code: 'ME', name: 'Montenegro', dialCode: '+382', flag: '🇲🇪', phoneFormat: /^\d{8}$/ },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', phoneFormat: /^\d{9}$/ },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿', phoneFormat: /^\d{9}$/ },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲', phoneFormat: /^\d{8,10}$/ },
  { code: 'NA', name: 'Namibia', dialCode: '+264', flag: '🇳🇦', phoneFormat: /^\d{9}$/ },
  { code: 'NR', name: 'Nauru', dialCode: '+674', flag: '🇳🇷', phoneFormat: /^\d{7}$/ },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', phoneFormat: /^\d{10}$/ },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', phoneFormat: /^\d{9}$/ },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', phoneFormat: /^\d{9}$/ },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', phoneFormat: /^\d{8}$/ },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪', phoneFormat: /^\d{8}$/ },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', phoneFormat: /^\d{10}$/ },
  { code: 'KP', name: 'North Korea', dialCode: '+850', flag: '🇰🇵', phoneFormat: /^\d{8}$/ },
  { code: 'MK', name: 'North Macedonia', dialCode: '+389', flag: '🇲🇰', phoneFormat: /^\d{8}$/ },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', phoneFormat: /^\d{8}$/ },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', phoneFormat: /^\d{8}$/ },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', phoneFormat: /^\d{10}$/ },
  { code: 'PW', name: 'Palau', dialCode: '+680', flag: '🇵🇼', phoneFormat: /^\d{7}$/ },
  { code: 'PS', name: 'Palestine', dialCode: '+970', flag: '🇵🇸', phoneFormat: /^\d{9}$/ },
  { code: 'PA', name: 'Panama', dialCode: '+507', flag: '🇵🇦', phoneFormat: /^\d{8}$/ },
  { code: 'PG', name: 'Papua New Guinea', dialCode: '+675', flag: '🇵🇬', phoneFormat: /^\d{8}$/ },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', phoneFormat: /^\d{9}$/ },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪', phoneFormat: /^\d{9}$/ },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', phoneFormat: /^\d{10}$/ },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', phoneFormat: /^\d{9}$/ },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', phoneFormat: /^\d{9}$/ },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', phoneFormat: /^\d{8}$/ },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴', phoneFormat: /^\d{9}$/ },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', phoneFormat: /^\d{10}$/ },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼', phoneFormat: /^\d{9}$/ },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', phoneFormat: /^\d{9}$/ },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳', phoneFormat: /^\d{9}$/ },
  { code: 'RS', name: 'Serbia', dialCode: '+381', flag: '🇷🇸', phoneFormat: /^\d{9}$/ },
  { code: 'SC', name: 'Seychelles', dialCode: '+248', flag: '🇸🇨', phoneFormat: /^\d{7}$/ },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱', phoneFormat: /^\d{8}$/ },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', phoneFormat: /^\d{8}$/ },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', flag: '🇸🇰', phoneFormat: /^\d{9}$/ },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮', phoneFormat: /^\d{8}$/ },
  { code: 'SO', name: 'Somalia', dialCode: '+252', flag: '🇸🇴', phoneFormat: /^\d{8}$/ },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', phoneFormat: /^\d{9}$/ },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', phoneFormat: /^\d{9,10}$/ },
  { code: 'SS', name: 'South Sudan', dialCode: '+211', flag: '🇸🇸', phoneFormat: /^\d{9}$/ },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', phoneFormat: /^\d{9}$/ },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', phoneFormat: /^\d{9}$/ },
  { code: 'SD', name: 'Sudan', dialCode: '+249', flag: '🇸🇩', phoneFormat: /^\d{9}$/ },
  { code: 'SR', name: 'Suriname', dialCode: '+597', flag: '🇸🇷', phoneFormat: /^\d{7}$/ },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', phoneFormat: /^\d{9}$/ },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', phoneFormat: /^\d{9}$/ },
  { code: 'SY', name: 'Syria', dialCode: '+963', flag: '🇸🇾', phoneFormat: /^\d{9}$/ },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', phoneFormat: /^\d{9}$/ },
  { code: 'TJ', name: 'Tajikistan', dialCode: '+992', flag: '🇹🇯', phoneFormat: /^\d{9}$/ },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', phoneFormat: /^\d{9}$/ },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', phoneFormat: /^\d{9}$/ },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', phoneFormat: /^\d{8}$/ },
  { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1', flag: '🇹🇹', phoneFormat: /^\d{10}$/ },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳', phoneFormat: /^\d{8}$/ },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', phoneFormat: /^\d{10}$/ },
  { code: 'TM', name: 'Turkmenistan', dialCode: '+993', flag: '🇹🇲', phoneFormat: /^\d{8}$/ },
  { code: 'TV', name: 'Tuvalu', dialCode: '+688', flag: '🇹🇻', phoneFormat: /^\d{5,6}$/ },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', phoneFormat: /^\d{9}$/ },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', phoneFormat: /^\d{9}$/ },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', phoneFormat: /^\d{9}$/ },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', phoneFormat: /^\d{10}$/ },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', phoneFormat: /^\d{10}$/ },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', phoneFormat: /^\d{8}$/ },
  { code: 'UZ', name: 'Uzbekistan', dialCode: '+998', flag: '🇺🇿', phoneFormat: /^\d{9}$/ },
  { code: 'VU', name: 'Vanuatu', dialCode: '+678', flag: '🇻🇺', phoneFormat: /^\d{7}$/ },
  { code: 'VA', name: 'Vatican City', dialCode: '+379', flag: '🇻🇦', phoneFormat: /^\d{8}$/ },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', phoneFormat: /^\d{10}$/ },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', phoneFormat: /^\d{9}$/ },
  { code: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪', phoneFormat: /^\d{9}$/ },
  { code: 'ZM', name: 'Zambia', dialCode: '+260', flag: '🇿🇲', phoneFormat: /^\d{9}$/ },
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼', phoneFormat: /^\d{9}$/ }
];

// Get all countries (for general use)
export const getAllCountries = () => countries;

// Get countries excluding Cameroon (for international buyers)
export const getInternationalCountries = () => 
  countries.filter(c => c.code !== 'CM');

// Get Cameroon only (for local buyers)
export const getLocalCountry = () => 
  countries.find(c => c.code === 'CM');

// Get country by code
export const getCountryByCode = (code) => 
  countries.find(c => c.code === code);

// Get country by dial code
export const getCountryByDialCode = (dialCode) => 
  countries.find(c => c.dialCode === dialCode);

// Validate phone number for a specific country
export const validatePhoneForCountry = (phone, countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) return { valid: false, message: 'Invalid country' };
  
  const cleanPhone = phone.replace(/\D/g, '');
  const valid = country.phoneFormat.test(cleanPhone);
  
  return {
    valid,
    message: valid ? 'Valid' : `Invalid phone format for ${country.name}`,
    country
  };
};

// Format phone number with country code
export const formatPhoneInternational = (phone, countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) return null;
  
  const cleanPhone = phone.replace(/\D/g, '');
  return `${country.dialCode}${cleanPhone}`;
};

// Get placeholder for phone input based on country
export const getPhonePlaceholder = (countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) return 'Phone number';
  
  // Generate placeholder based on phone format length
  const match = country.phoneFormat.source.match(/\{(\d+)(?:,(\d+))?\}/);
  const length = match ? parseInt(match[1]) : 9;
  
  if (countryCode === 'CM') return '6XX XXX XXX';
  if (length === 9) return 'XXX XXX XXX';
  if (length === 10) return 'XXX XXX XXXX';
  if (length === 8) return 'XXX XXXX';
  return 'Phone number';
};
