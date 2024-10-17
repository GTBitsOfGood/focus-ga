import { useEffect, RefObject } from "react";

/**
 * A generic hook used for elements needing to know whether the user has clicked off of its element.
 *
 * The most common use for this is dropdowns (if you click off the dropdown, it should close).
 *
 * @param elementRef The element to track
 * @param onClickOff A handler the developer passes in to take action when the user clicked off
 * @param exceptions A list of React Ref elements to exclude (special cases where it actually is the same element)
 */
const useClickOff = (elementRef: RefObject<HTMLElement>, onClickOff: () => void, exceptions?: RefObject<HTMLElement>[]) => {
  useEffect(() => {
    /**
     * An internal click handler evaluating whether a mousedown was inside or outside the elementRef
     * @param event The click event
     */
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the target is any of the exceptions, ignore if found
      if (
        exceptions?.some((element) => element.current && element.current.contains(event.target as Node))
      ) {
        return;
      }

      // Check if target from clicking was NOT the element the hook belongs to
      if (
        elementRef.current &&
        !elementRef.current.contains(event.target as Node)
      ) {
        onClickOff();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Always dispose mousedown to avoid redundant events
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [elementRef, onClickOff, exceptions]);
};

export default useClickOff;
