import React from "react";
import {Modal, ModalBody, ModalContent, ModalHeader} from "@heroui/react";

interface ModalWindowProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    content: React.ReactNode;
    title?: string;
    size?: "3xl" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "full" | undefined;
}

const ModalWindow: React.FC<ModalWindowProps> = ({isOpen, onOpenChange, content, title, size}) => {

    return (
        <Modal isOpen={isOpen} size={size ?? "xl"} onOpenChange={onOpenChange}
        placement={"center" } className = "top-0 relative max-h-screen overflow-y-auto "
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
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
  