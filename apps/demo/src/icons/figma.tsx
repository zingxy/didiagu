/**
 * @file index.ts
 * @description Copy from figma，仅限学习交流使用
 * @author HongQing Zeng
 * @date 2025-11-13
 * @version 1.0.0
 */

interface IconProps {
  fill?: string;
  size?: number | string;
}

const defalutIconProps: IconProps = {
  fill: 'currentColor',
  size: '1em',
};
export const FreeDrawModeIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24"
    >
      <path d="M13.407 5.06c.61-.123 1.227-.079 1.658.342l.134.15c.277.362.316.79.208 1.205-.114.44-.397.887-.734 1.314-.679.86-1.74 1.828-2.748 2.76-1.031.951-2.01 1.866-2.606 2.662-.3.4-.466.724-.517.969-.044.21-.003.34.12.46l.065.053c.073.043.167.061.313.039.217-.034.505-.156.866-.378.72-.445 1.561-1.183 2.445-1.966.862-.763 1.768-1.571 2.57-2.076.4-.252.817-.457 1.221-.528.427-.073.87.002 1.223.347l.102.112c.22.271.297.593.266.917-.032.345-.183.684-.364.993-.363.618-.963 1.297-1.515 1.922-.574.652-1.1 1.252-1.403 1.768-.151.257-.218.449-.23.581-.01.105.012.163.072.22l.054.04c.074.038.214.062.474-.031.356-.128.853-.456 1.465-1.101a.5.5 0 0 1 .726.688c-.666.702-1.292 1.152-1.854 1.354-.535.192-1.08.173-1.485-.163l-.08-.071a1.23 1.23 0 0 1-.369-1.03c.033-.344.183-.684.365-.993.362-.617.964-1.297 1.515-1.923.574-.651 1.1-1.25 1.403-1.766.15-.258.219-.45.231-.581.007-.08-.004-.132-.035-.177l-.038-.045c-.07-.068-.162-.108-.353-.075-.213.037-.5.161-.858.388-.717.451-1.555 1.194-2.44 1.978-.862.764-1.773 1.57-2.584 2.07-.404.248-.826.45-1.237.514-.38.059-.767 0-1.095-.247l-.136-.118c-.402-.394-.502-.887-.399-1.38.097-.46.367-.924.697-1.363.662-.885 1.717-1.865 2.727-2.798C12.28 9.14 13.27 8.234 13.89 7.45c.31-.394.489-.71.55-.946.04-.152.029-.246-.017-.32l-.057-.069c-.082-.08-.284-.172-.76-.076-.467.094-1.091.352-1.863.803-1.537.898-3.552 2.495-5.892 4.786a.5.5 0 0 1-.7-.715c2.37-2.32 4.45-3.98 6.087-4.935.816-.477 1.55-.794 2.17-.92"></path>
    </svg>
  );
};

export const DesignModeIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24"
    >
      <path
        fill=""
        d="M12.11 13.956c-.44-1.121.618-2.23 1.738-1.885l.108.038 4.15 1.63.115.051c1.136.556 1.027 2.254-.218 2.637l-1.205.372-.37 1.205c-.397 1.29-2.196 1.356-2.689.102zm1.48-.916a.425.425 0 0 0-.55.55l1.63 4.15c.138.35.618.356.775.038l.027-.068.526-1.711 1.711-.527a.425.425 0 0 0 .031-.802zM16.5 6A1.5 1.5 0 0 1 18 7.5v1a1.5 1.5 0 0 1-1.5 1.5H10v6.5A1.5 1.5 0 0 1 8.5 18h-1A1.5 1.5 0 0 1 6 16.5v-9A1.5 1.5 0 0 1 7.5 6zM7 16.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V15h-.5a.5.5 0 0 1 0-1H9v-1h-.5a.5.5 0 0 1 0-1H9v-2H7zM7.5 7a.5.5 0 0 0-.5.5V9h2V7zM10 9h2v-.5a.5.5 0 0 1 1 0V9h1v-.5a.5.5 0 0 1 1 0V9h1.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H10z"
      ></path>
    </svg>
  );
};

export const DevModeIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24"
    >
      <path d="M13.631 6.018a.5.5 0 0 1 .367.513l-.016.1-3 11-.036.095a.5.5 0 0 1-.93-.358l3-11 .037-.095a.5.5 0 0 1 .578-.255M8.224 8.582a.501.501 0 0 1 .693.693l-.064.079L6.206 12l2.647 2.646a.5.5 0 1 1-.707.707l-3-3a.5.5 0 0 1 0-.707l3-3zm6.922.064a.5.5 0 0 1 .707 0l3 3a.5.5 0 0 1 0 .707l-3 3-.078.065a.5.5 0 0 1-.694-.693l.065-.079L17.792 12l-2.646-2.646a.5.5 0 0 1 0-.707"></path>
    </svg>
  );
};

export const SelectToolIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24L"
    >
      <path d="M4.586 4.586a2 2 0 0 1 2.005-.497l.14.05 13 5.107a2 2 0 0 1 1.267 1.779v.159a2 2 0 0 1-1.26 1.782l-.15.053-5.024 1.545-1.545 5.024a2 2 0 0 1-1.677 1.398l-.158.012a2 2 0 0 1-1.938-1.267l-5.107-13a2 2 0 0 1 .447-2.145m1.78.484a1 1 0 0 0-1.073.223l-.097.112a1 1 0 0 0-.127.96l5.108 13a1 1 0 0 0 .811.628l.158.006a1 1 0 0 0 .859-.558l.058-.147 1.7-5.53 5.531-1.701a1 1 0 0 0 .687-.76l.018-.157a1 1 0 0 0-.492-.9l-.142-.069z"></path>
    </svg>
  );
};
export const FrameToolIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24L"
    >
      <path
        fill-rule="evenodd"
        d="M7.5 4a.5.5 0 0 0-.5.5V7H4.5a.5.5 0 0 0 0 1H7v8H4.5a.5.5 0 0 0 0 1H7v2.5a.5.5 0 0 0 1 0V17h8v2.5a.5.5 0 0 0 1 0V17h2.5a.5.5 0 0 0 0-1H17V8h2.5a.5.5 0 0 0 0-1H17V4.5a.5.5 0 0 0-1 0V7H8V4.5a.5.5 0 0 0-.5-.5M16 8H8v8h8z"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};
export const RectToolIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24L"
    >
      <path
        fill-rule="evenodd"
        d="M18 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};
export const PenToolIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24L"
    >
      <path d="M4.886 3.21a1 1 0 0 1 .812-.19l7.698 1.56.338.076a7.67 7.67 0 0 1 5.806 7.266v.346l-.008.329 1.197 1.197a1 1 0 0 1 0 1.414l-5.523 5.522a1 1 0 0 1-1.413 0l-1.198-1.197-.328.008a7.67 7.67 0 0 1-7.612-5.806l-.077-.338L3.02 5.7a1 1 0 0 1 .274-.906l1.5-1.5zm.674 9.99a6.666 6.666 0 0 0 6.383 5.342h.3l.756-.018 1.5 1.5 5.523-5.522-1.5-1.5.018-.756a6.67 6.67 0 0 0-5.048-6.619l-.295-.066L5.5 4l-.396.397 5.16 5.16A3 3 0 0 1 12 9.001 3.001 3.001 0 0 1 12 15a3 3 0 0 1-2.444-4.737l-5.16-5.16L4 5.5zM12 10.001a2 2 0 0 0-2 2l.01.204a2 2 0 0 0 1.786 1.785L12 14a2 2 0 0 0 1.989-1.795l.01-.204a2 2 0 0 0-1.795-1.99z"></path>
    </svg>
  );
};

export const TextToolIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24L"
    >
      <path
        fill-rule="evenodd"
        d="M4 5.5a.5.5 0 0 1 .5-.5h14a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V6h-6v12h2.5a.5.5 0 0 1 0 1h-6a.5.5 0 0 1 0-1H11V6H5v2.5a.5.5 0 0 1-1 0z"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};
export const CommentToolIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24L"
    >
      <path
        fill-rule="evenodd"
        d="M7.2 19H12a7 7 0 1 0-7-7v4.8c0 .577 0 .949.024 1.232.022.272.06.372.085.422a1 1 0 0 0 .437.437c.05.025.15.063.422.085C6.25 19 6.623 19 7.2 19M12 4a8 8 0 0 0-8 8v4.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C5.52 20 6.08 20 7.2 20H12a8 8 0 1 0 0-16"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};
export const ActionToolIcon = (props: IconProps) => {
  const { fill, size } = { ...defalutIconProps, ...props };
  return (
    <svg
      width={size}
      height={size}
      fill={fill}
      viewBox="0 0 24 24"
      data-fpl-icon-size="24L"
    >
      <path d="M9 13a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm7.5 0a.5.5 0 0 1 .5.5V16h2.5a.5.5 0 0 1 0 1H17v2.5a.5.5 0 0 1-1 0V17h-2.5a.5.5 0 0 1 0-1H16v-2.5a.5.5 0 0 1 .5-.5M6 14a1 1 0 0 0-1 1v3a1 1 0 0 0 .897.995L6 19h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zm.87-10.275a1 1 0 0 1 1.337.068l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414l3-3zM16.5 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7m-12 3.5 3 3 3-3-3-3zm12-2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5"></path>
    </svg>
  );
};
