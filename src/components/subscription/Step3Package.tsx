import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    RadioGroup, FormControlLabel, Radio, Typography
} from '@mui/material';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';

interface Props {
    handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    values: { package: string };
}

const Step3Package: React.FC<Props> = ({ handleChange, values }) => {
    const [currentPackage, setCurrentPackage] = useState<string>('Gói mặc định');
    const uid = useSelector((state: RootState) => state.uid.uid);
    console.log('UID:', uid);

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const q = query(collection(db, 'subscriptions'), where('uid', '==', uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    const data = docSnap.data();
                    console.log('Fetched data:', data);
                    setCurrentPackage(data.package || 'Gói mặc định');
                } else {
                    console.log('No such document!');
                    setCurrentPackage('Gói mặc định');
                }
            } catch (error) {
                console.error('Error fetching package:', error);
                setCurrentPackage('Gói mặc định');
            }
        };

        if (uid) {
            fetchPackage();
        }
    }, [uid]);

    return (
        <div>
            <Typography variant="h4" align="center" gutterBottom>Chọn gói đăng ký</Typography>
            <Typography className='mt-10' variant="h6" align="left" gutterBottom>Gói hiện tại: {currentPackage}</Typography>

            <TableContainer className='mt-10' component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Mặc định 0$</TableCell>
                            <TableCell>Gói tên 9.99$</TableCell>
                            <TableCell>Gói tick xanh 9.99$</TableCell>
                            <TableCell>Gói VIP 15$</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Tên màu sắc</TableCell>
                            <TableCell align="center"><FaTimes className='text-2xl' /></TableCell>
                            <TableCell align="center"><FaCheck className='text-2xl text-green-500' /></TableCell>
                            <TableCell align="center"><FaTimes className='text-2xl' /></TableCell>
                            <TableCell align="center"><FaCheck className='text-2xl text-green-500' /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Tick xanh uy tín</TableCell>
                            <TableCell align="center"><FaTimes className='text-2xl' /></TableCell>
                            <TableCell align="center"><FaTimes className='text-2xl' /></TableCell>
                            <TableCell align="center"><FaCheck className='text-2xl text-green-500' /></TableCell>
                            <TableCell align="center"><FaCheck className='text-2xl text-green-500' /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Chọn gói</TableCell>
                            <TableCell align="center">
                                <RadioGroup
                                    aria-label="package"
                                    name="package"
                                    value={values.package}
                                    onChange={handleChange('package')}
                                >
                                    <FormControlLabel value="Gói mặc định" control={<Radio />} label="Mặc định" />
                                </RadioGroup>
                            </TableCell>
                            <TableCell align="center">
                                <RadioGroup
                                    aria-label="package"
                                    name="package"
                                    value={values.package}
                                    onChange={handleChange('package')}
                                >
                                    <FormControlLabel value="Gói tên" control={<Radio />} label="Tên màu sắc" />
                                </RadioGroup>
                            </TableCell>
                            <TableCell align="center">
                                <RadioGroup
                                    aria-label="package"
                                    name="package"
                                    value={values.package}
                                    onChange={handleChange('package')}
                                >
                                    <FormControlLabel value="Gói tick xanh" control={<Radio />} label="Tick xanh" />
                                </RadioGroup>
                            </TableCell>
                            <TableCell align="center">
                                <RadioGroup
                                    aria-label="package"
                                    name="package"
                                    value={values.package}
                                    onChange={handleChange('package')}
                                >
                                    <FormControlLabel value="Gói VIP" control={<Radio />} label="VIP" />
                                </RadioGroup>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Step3Package;
