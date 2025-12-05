function Icon({ name, className = "w-5 h-5", ...props }) {
  let iconPath;

  try {
    iconPath = new URL(`../../assets/icons/${name}.svg`, import.meta.url).href;
  } catch (error) {
    console.error(`Icon "${name}" not found`);
    return null;
  }

  return (
    <img src={iconPath} alt={`${name} icon`} className={className} {...props} />
  );
}

export default Icon;
