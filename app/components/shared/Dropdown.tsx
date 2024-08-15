"use client"

import React, { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Input } from '@headlessui/react';
import { maakFlexpool, haalFlexpools } from '@/app/lib/actions/flexpool.actions';
import { IFlexpool } from '@/app/lib/models/flexpool.model';
import { useUser } from "@clerk/nextjs";
import { fetchBedrijfByClerkId } from '@/app/lib/actions/bedrijven.actions';
import mongoose from 'mongoose';

type Flexpool = {
  _id: string;
  titel: string;
};

type DropdownProps = {
  value?: string;
  onChangeHandler?: (value: string) => void;
  flexpools: Flexpool[];
  userId: string;
};

const Dropdown = ({ value, onChangeHandler, flexpools, userId }: DropdownProps) => {

    const [newFlexpoolTitle, setNewFlexpoolTitle] = useState('');
    console.log("Flexpools:", flexpools);

  
    const voegFlexpoolToe = async () => {
      try {
        if (!userId) {
          console.error("BedrijfId is not available");
          return;
        }
  
        const newFlexpool = await maakFlexpool({
          titel: newFlexpoolTitle.trim(),
          bedrijfId: new mongoose.Types.ObjectId(userId),
        });
  
        // You should manage the flexpools state in the parent component and update it here
        setNewFlexpoolTitle("");
      } catch (error) {
        console.error("Error creating flexpool:", error);
      }
    };

    return (
        <div>
            <Select onValueChange={onChangeHandler} defaultValue={value}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="flexpool" />
                </SelectTrigger>
                <SelectContent>
                  
                      {flexpools.length > 0 ? (
                        flexpools.map((flexpool) => (
                          <SelectItem
                            key={flexpool._id.toString()}
                            value={flexpool._id.toString()}
                            className="select-item p-regular-14"
                          >
                            {flexpool.titel.toString()}
                          </SelectItem>
                        ))
                      ) : (
                        <div className='ml-8 items-center justify-center text-sm'>geen flexpools</div>
                      )}

                    <AlertDialog>
                        <AlertDialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500">
                            Maak flexpool
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Flexpool</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <Input type="text" placeholder="flexpool toevoegen" className="input-field mt-3" onChange={(e) => setNewFlexpoolTitle(e.target.value)} />
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuleer</AlertDialogCancel>
                                <AlertDialogAction onClick={voegFlexpoolToe}>Toevoegen</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SelectContent>
            </Select>
        </div>
    )
}

export default Dropdown;
