import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody
  } from "@heroui/react";

  interface ModalWindowProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    content: React.ReactNode;
    title: string;
  }

 const ModalWindow: React.FC<ModalWindowProps> = ({ isOpen, onOpenChange, content , title}) => {
  
    return (
      <>
        <Modal isOpen={isOpen} size={"xl"} onOpenChange={onOpenChange} >
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
      </>
    );
  };
  export default ModalWindow;
  