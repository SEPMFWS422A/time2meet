import React from "react";
import {Modal, ModalBody, ModalContent, ModalHeader} from "@heroui/react";

interface ModalWindowProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    content: React.ReactNode;
    title?: string;
    size?: "3xl" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "full" | undefined;
    isDismissable?: boolean
}

const ModalWindow: React.FC<ModalWindowProps> = ({isOpen, onOpenChange, content, title, size, isDismissable}) => {

    return (
        <Modal isOpen={isOpen} size={size ?? "xl"} onOpenChange={onOpenChange}
        placement={"center" } className = "top-0 relative max-h-screen overflow-y-auto "
        isDismissable={isDismissable}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col items-center gap-1" id="modalHeader">{title}</ModalHeader>
                        <ModalBody>
                            {content}
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
export default ModalWindow;
  